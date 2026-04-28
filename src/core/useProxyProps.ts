import { inject, provide } from "vue";
import { configPropsKey } from "./symbol.js";

export function provideProxyProps(props: any) {
  provide(configPropsKey, props);
}

export function useProxyProps() {
  return inject(configPropsKey)!;
}
