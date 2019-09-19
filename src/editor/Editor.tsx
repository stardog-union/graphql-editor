import * as React from 'react';
import { GraphController } from '../Graph';
import { CodeEditor, CodeEditorOuterProps } from './Code';
import * as styles from './style/Editor';

export interface EditorState {
  projectId?: string;
  code: string;
  stitches?: string;
  errors: string;
}

export type EditorProps = {
  editorVisible: boolean;
  schema?: string;
  graphController?: (controller: GraphController) => void;
} & CodeEditorOuterProps;

/**
 * Main Editor component
 *
 * @export
 * @class Editor
 */
export class Editor extends React.Component<EditorProps, EditorState> {
  state: EditorState = {
    projectId: undefined,
    code: '',
    stitches: '',
    errors: ''
  };
  controller: GraphController = new GraphController();
  private containerRef = React.createRef<HTMLDivElement>();
  receiveSchema = (code: string, stitches?: string) => {
    this.setState({ code, stitches, errors: '' });
  };
  receiveErrors = (errors: string) => {
    this.setState({ errors });
  };
  componentDidMount() {
    window.requestAnimationFrame(() => {
      // We should wait for next animation frame so TypeStyle
      // had its time to refresh all the classes - this way
      // our sizes won't break
      if (!this.containerRef.current) {
        return;
      }

      this.controller.setDOMElement(this.containerRef.current);
      this.controller.setPassSchema(this.receiveSchema);
      this.controller.setPassDiagramErrors(this.receiveErrors);
      this.controller.setReadOnly(!!this.props.readonly);
      if (this.props.graphController) {
        this.props.graphController(this.controller);
      }
      if (this.props.schema) {
        this.controller.loadGraphQL(this.props.schema);
      }
    });
  }
  componentDidUpdate(prevProps: EditorProps) {
    if (this.props.editorVisible !== prevProps.editorVisible) {
      this.controller.resizeDiagram();
    }
    if (this.props.readonly !== prevProps.readonly) {
      this.controller.setReadOnly(!!this.props.readonly);
    }
  }
  render() {
    return (
      <>
        {this.props.editorVisible && (
          <CodeEditor
            CustomEditor={this.props.CustomEditor}
            controller={this.controller}
            schema={this.state.code}
            readonly={this.props.readonly}
            onResized={this.controller.resizeDiagram}
            schemaChanged={(code) => {
              this.setState({
                code
              });
            }}
          />
        )}
        <div
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            height: '100vh',
            flex: '1'
          }}
          ref={this.containerRef}
        />
        {this.state.errors && <div className={styles.ErrorContainer}>{this.state.errors}</div>}
      </>
    );
  }
}
