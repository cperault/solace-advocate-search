import { render as rtlRender } from "@testing-library/react";
import { ReactElement } from "react";
import { AdvocateServiceProvider } from "@/app/context/AdvocateServiceContext";

function render(ui: ReactElement, { ...renderOptions } = {}) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AdvocateServiceProvider>{children}</AdvocateServiceProvider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";

export { render };
