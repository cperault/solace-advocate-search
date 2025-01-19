import { PhoneNumber } from "@/app/utils/PhoneNumber";
import { render, screen } from "@testing-library/react";

describe("PhoneNumber", () => {
  it("should return JSX with a clickable link for valid numbers", () => {
    const result = PhoneNumber("1234567890");
    expect(result).not.toBe("N/A");

    render(<>{result}</>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "tel:1234567890");
    expect(link).toHaveAttribute("aria-label", "Call (123) 456-7890");
    expect(link).toHaveTextContent("(123) 456-7890");
    expect(link).toHaveClass("phone-number");
  });

  it("should return JSX with a span for invalid numbers", () => {
    const result = PhoneNumber("123");
    expect(result).not.toBe("N/A");

    render(<>{result}</>);
    const span = screen.getByText("N/A");
    expect(span.tagName).toBe("SPAN");
  });

  it("should handle numbers with existing formatting", () => {
    const result = PhoneNumber("(123) 456-7890");
    render(<>{result}</>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "tel:(123) 456-7890");
    expect(link).toHaveTextContent("(123) 456-7890");
  });

  it("should handle number type input", () => {
    const result = PhoneNumber(1234567890);
    render(<>{result}</>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "tel:1234567890");
    expect(link).toHaveTextContent("(123) 456-7890");
  });

  it("should handle edge cases", () => {
    const { rerender } = render(<>{PhoneNumber("")}</>);
    expect(screen.getByText("N/A")).toBeInTheDocument();

    rerender(<>{PhoneNumber(undefined as any)}</>);
    expect(screen.getByText("N/A")).toBeInTheDocument();

    rerender(<>{PhoneNumber(null as any)}</>);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
