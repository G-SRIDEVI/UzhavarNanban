import React from "react";
import { Sprout, Store, ShoppingBag, Truck } from "lucide-react";

export const RoleBadge = ({ role }) => {
  switch (role) {
    case "farmer":
      return (
        <span className="badge badge-success" style={{ gap: "0.4rem" }}>
          <Sprout size={13} /> Farmer / விவசாயி
        </span>
      );
    case "dealer":
      return (
        <span className="badge badge-info" style={{ gap: "0.4rem" }}>
          <Store size={13} /> Agri Dealer / உரக்கடை
        </span>
      );
    case "buyer":
      return (
        <span className="badge badge-warning" style={{ gap: "0.4rem" }}>
          <ShoppingBag size={13} /> Produce Buyer / வியாபாரி
        </span>
      );
    case "machinery_owner":
      return (
        <span className="badge" style={{ background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe", gap: "0.4rem" }}>
          <Truck size={13} /> Machinery Owner / இயந்திரம்
        </span>
      );
    default:
      return <span className="badge badge-neutral">{role}</span>;
  }
};
