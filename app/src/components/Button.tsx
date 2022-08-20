import styled from "@emotion/styled";

const Button = styled.button((props: { size?: "small" | "medium" }) => ({
  cursor: "pointer",
  outline: 0,
  color: "#fff",
  backgroundColor: "#0d6efd",
  borderColor: "#0d6efd",
  display: "inline-block",
  fontWeight: 400,
  lineHeight: 1.5,
  textAlign: "center",
  border: "1px solid transparent",
  padding: props.size === "medium" ? "6px 12px" : "3px 6px",
  fontSize: props.size === "medium" ? "16px" : "14px",
  borderRadius: ".25rem",
  transition:
    "color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out",
  ":hover": {
    color: "#fff",
    backgroundColor: "#0b5ed7",
    bordercolor: "#0a58ca",
  },
  ":focus-visible": {
    outline: "1px solid blue",
  },
}));

export { Button };
