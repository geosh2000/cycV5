/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

interface JQuery {
   tablesorter(options?: any, callback?: Function) : any;
}
