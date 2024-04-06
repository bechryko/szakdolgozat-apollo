import { LanguageLabelKeyPipe } from "./language-label-key.pipe";

describe('LanguageLabelKeyPipe', () => {
   let pipe: LanguageLabelKeyPipe;

   beforeEach(() => {
      pipe = new LanguageLabelKeyPipe();
   });

   it("should transform correctly", () => {
      expect(pipe.transform("en")).toBe("LANGUAGES.EN");
      expect(pipe.transform("hu")).toBe("LANGUAGES.HU");
   });
});
