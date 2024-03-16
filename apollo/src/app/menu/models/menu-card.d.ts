import { ButtonDescription, MultiLanguage } from "@apollo/shared/models";

export interface MenuCard {
   title: MultiLanguage<string>;
   description: MultiLanguage<string>;
   imageUrl?: string;
   button?: ButtonDescription;
   fixed?: boolean;
}
