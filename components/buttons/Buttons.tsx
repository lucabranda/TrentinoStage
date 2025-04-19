"use client";
import React from "react";
import { Button } from "antd";

interface BaseButtonProps {
  className?: string;
  children?: React.ReactNode;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  style?: React.CSSProperties;
  htmlType?: "submit" | "reset" | "button";
  type?: "primary" | "default" | "link" | "dashed";
  loading?: boolean;
}

const BaseButton: React.FC<BaseButtonProps> = (props) => {
  const { className, children, href, onClick,style, htmlType, type, loading } = props;
  const buttonStyle: React.CSSProperties = { ...style };

  return (
    <Button
      type={type}
      className={className}
      style={buttonStyle}
      href={href}
      onClick={onClick}
      htmlType={htmlType}
      loading={loading}
    >
      {children}
    </Button>
  );
};

const PrimaryButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton {...props} type="primary" style={{ backgroundColor: props.style?.backgroundColor || "#1890ff", color: props.style?.color || "#fff"}} />
);

const DefaultButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton {...props} type="default" style={{ borderColor: props.style?.borderColor || "#d9d9d9", color: props.style?.color || "#000" }} />
);

const DashedButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton {...props} type="dashed" style={{ borderColor: props.style?.borderColor || "#d9d9d9", color: props.style?.color || "#000" }} />
);

const LinkButton: React.FC<BaseButtonProps> = (props) => (
  <BaseButton {...props} type="link" style={{ color: props.style?.color || "#1890ff", border: props.style?.border || "1px solid #1890ff" }} />
);

export { PrimaryButton, DefaultButton, DashedButton, LinkButton };



