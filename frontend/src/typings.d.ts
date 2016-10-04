// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;
declare var module: { id: string };
declare var require: any;

// For npm module 'dropzone'
declare module 'dropzone' {
  var Dropzone: any;
  export default Dropzone;
}
