export function readFile<T>(file: File, parserFn: (exported: string) => T): Promise<T> {
   return new Promise((resolve, reject) => {
      if(!file) {
         reject("ERROR.FILE.NOT_FOUND");
      }
      if(file.type !== 'text/plain') {
         reject("ERROR.FILE.INVALID_TYPE");
      }
      if(file.name.split('.').pop() !== 'txt') {
         reject("ERROR.FILE.INVALID_FORMAT");
      }

      const fileReader = new FileReader();
      fileReader.onload = () => {
         const parsed = parserFn(fileReader.result as string);
         resolve(parsed);
      };
      fileReader.readAsText(file);
   });
}
