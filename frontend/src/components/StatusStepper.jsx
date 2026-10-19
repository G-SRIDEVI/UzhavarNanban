import React from "react";
import { Check, Clock, Package, Truck, CheckCircle2 } from "lucide-react";

export const StatusStepper = ({ currentStatus }) => {
  const steps = [
    { key: "payment_confirmed", label: "Payment Confirmed", tamilLabel: "கட்டணம் செலுத்தப்பட்டது", icon: Check },
    { key: "order_accepted", label: "Order Accepted", tamilLabel: "ஆர்டர் ஏற்கப்பட்டது", icon: Clock },
    { key: "preparing", label: "Preparing Items", tamilLabel: "பொருட்கள் பேக்கிங்", icon: Package },
    { key: "out_for_delivery", label: "Out for Delivery", tamilLabel: "டெலிவரிக்கு புறப்பட்டது", icon: Truck },
    { key: "delivered", label: "Delivered", tamilLabel: "டெலிவரி செய்யப்பட்டது", icon: CheckCircle2 },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "payment_pending":
        return 0;
      case "payment_confirmed":
        return 0;
      case "order_accepted":
        return 1;
      case "preparing":
      case "ready_for_dispatch":
        return 2;
      case "out_for_delivery":
        return 3;
      case "delivered":
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const progressPercent = (activeIndex / (steps.length - 1)) * 100;

  return (
    <div style={{ margin: "1.75rem 0 1.25rem 0" }}>
      <div className="stepper-container">
        <div className="stepper-progress-bg" />
        <div
          className="stepper-progress-fill"
          style={{ width: `calc(${progressPercent}% * 0.88)` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex || currentStatus === "delivered";
          const isActive = idx === activeIndex && currentStatus !== "delivered";

          return (
            <div
              key={step.key}
              className={`stepper-step ${
                isCompleted ? "completed" : isActive ? "active" : ""
              }`}
            >
              <div className="stepper-icon">
                {isCompleted ? <Check size={18} strokeWidth={3} /> : <Icon size={18} />}
              </div>
              <div className="stepper-label">
                <div>{step.label}</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 400 }}>
                  {step.tamilLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
