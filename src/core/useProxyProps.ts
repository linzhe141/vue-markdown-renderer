import { inject, provide } from "vue";
import { configPropsKey } from "./symbol";

export function provideProxyProps(props: any) {
  const proxy = new Proxy(props, {
    get(target, key) {
      return Reflect.get(target, key);
    },
  });
  provide(configPropsKey, proxy);
}

export function useProxyProps() {
  return inject(configPropsKey)!;
}
