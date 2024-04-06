import { RouteUrls } from "@apollo/app.routes";

export function parameterizedRoute(route: RouteUrls, ...params: string[]): string {
   return [route, ...params].join('/:');
}
