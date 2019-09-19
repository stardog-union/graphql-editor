import * as cx from 'classnames';
import * as React from 'react';
import * as styles from './style/Code';
import { GraphController } from '../Graph';
import { sizeSidebar } from '../vars';
import { SelectLanguage } from './SelectLanguage';

export interface CustomEditorProps {
  onChange: Function;
  value: string | undefined;
}
export interface CodeEditorOuterProps {
  CustomEditor: React.ComponentType<CustomEditorProps>;
  schemaChanged?: (schema: string) => void;
  readonly?: boolean;
  generateHidden?: boolean;
}
export type CodeEditorProps = {
  schema: string;
  stitches?: string;
  controller: GraphController;
  onResized: () => void;
} & CodeEditorOuterProps;
export interface CodeEditorState {
  loadingUrl: boolean;
  isResizing?: boolean;
}

/**
 * React compontent holding GraphQL IDE
 *
 * @export
 * @class CodeEditor
 * @extends {React.Component<CodeEditorProps, CodeEditorState>}
 */
export class CodeEditor extends React.Component<CodeEditorProps, CodeEditorState> {
  public dragging = false;
  public startX?: number;
  public refSidebar?: HTMLDivElement;
  public refHandle?: HTMLDivElement;
  // public aceEditorRef?: AceEditor;
  public state: CodeEditorState = {
    loadingUrl: false
  };
  public taskRunner?: number;
  public startWidth = sizeSidebar;
  public width = sizeSidebar;
  public lastSchema?: string;
  public holder?: HTMLDivElement;
  // public editor?: AceEditor;
  public componentWillMount() {
    this.lastSchema = this.props.schema;
  }
  public componentWillReceiveProps(nextProps: CodeEditorProps) {
    if (nextProps.schema !== this.lastSchema) {
      this.lastSchema = nextProps.schema;
      this.forceUpdate();
    }
  }
  public render() {
    const { CustomEditor } = this.props;
    return (
      <>
        <div
          className={cx(styles.Sidebar)}
          ref={(ref) => {
            if (ref) {
              this.refSidebar = ref;
            }
          }}
        >
          {!this.props.readonly && (
            <SelectLanguage
              onGenerate={() =>
                this.lastSchema && this.props.controller.loadGraphQL(this.lastSchema)
              }
              generateVisible={!!this.lastSchema && !this.props.generateHidden}
            />
          )}
          <div
            className={cx(styles.CodeContainer)}
            ref={(ref) => {
              if (ref && !this.holder) {
                this.holder = ref;
              }
            }}
          >
            <CustomEditor onChange={this.codeChange} value={this.lastSchema} />
          </div>
          <div
            ref={(ref) => {
              if (ref) {
                this.refHandle = ref;
              }
            }}
            draggable={true}
            className={cx(styles.Resizer, {
              drag: this.state.isResizing
            })}
            onDragStart={(e) => {
              e.dataTransfer.setData('id', 'dragging');
              this.dragging = true;
              // this.refHandle!.style.left = '0px';
              this.setState({
                isResizing: true
              });
            }}
            onDrag={(e) => {
              this.dragging = true;
            }}
            onDragOver={(e) => {
              this.startX = this.startX || e.clientX;
              const deltaX = e.clientX - this.startX;
              this.width = this.startWidth + deltaX;
              if (this.width < this.minimumDrag) {
                this.width = this.minimumDrag;
              }
              if (this.width > this.maximumDrag) {
                this.width = this.maximumDrag;
              }
              this.refSidebar!.style.width = this.refSidebar!.style.flexBasis = `${this.width}px`;
              this.props.onResized();
            }}
            onDragEnd={(e) => {
              this.dragging = false;
              this.startX = undefined;
              this.startWidth = this.width;
              // this.refHandle!.style.left = `${this.width}px`;
              this.setState({
                isResizing: false
              });
            }}
            onDragExit={() => {
              this.setState({
                isResizing: false
              });
            }}
            onDragLeave={() => {
              this.setState({
                isResizing: false
              });
            }}
          />
        </div>
      </>
    );
  }

  private get minimumDrag() {
    return window.innerWidth * 0.15;
  }
  private get maximumDrag() {
    return window.innerWidth * 0.85;
  }

  private codeChange = (e: string) => {
    if (!this.lastSchema && this.props.schemaChanged) {
      this.props.schemaChanged(e);
    }
    this.lastSchema = e;
  };
}
