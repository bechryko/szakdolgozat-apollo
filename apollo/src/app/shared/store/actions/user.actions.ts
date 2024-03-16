import { ApolloUser } from "@apollo/shared/models";
import { LoginData, RegisterData } from "@apollo/user/models";
import { createActionGroup, emptyProps, props } from "@ngrx/store";

export const userActions = createActionGroup({
   source: "User",
   events: {
      "Login": props<{ loginData: LoginData }>(),
      "Register": props<{ registerData: RegisterData }>(),
      "Update user profile": props<{ user: ApolloUser }>(),
      "Logout": emptyProps()
   }
});
