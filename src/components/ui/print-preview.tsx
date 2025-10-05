import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order, MenuItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Printer, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface PrintPreviewProps {
  order: Order | null;
  type: "kitchen" | "bill";
  isOpen: boolean;
  onClose: () => void;
}

export function PrintPreview({
  order,
  type,
  isOpen,
  onClose,
}: PrintPreviewProps) {
  const { menuItems } = useAppStore();
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!order) return;
    
    // Mark order as printed when viewing in kitchen mode
    if (isOpen && type === "kitchen" && !order.isPrinted) {
      useAppStore.getState().updateOrder(order.id, { isPrinted: true });
    }
  }, [order, isOpen, type]);

  const getMenuItemById = (id: string): MenuItem | undefined => {
    return menuItems.find((item) => item.id === id);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; margin: 20px; }
          .print-content { width: 100%; max-width: 400px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 16px; margin-bottom: 20px; }
          .info { margin-bottom: 15px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
          .info-label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { text-align: left; padding: 8px 4px; }
          th { border-bottom: 1px solid #ddd; }
          .total-row { font-weight: bold; border-top: 1px solid #ddd; margin-top: 10px; padding-top: 10px; }
          .notes { margin-top: 20px; font-style: italic; }
          @media print {
            .no-print { display: none; }
            body { margin: 0; padding: 10px; }
          }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printRef.current.innerHTML);
        printWindow.document.write('<div class="no-print" style="text-align: center; margin-top: 30px;">');
        printWindow.document.write('<button onclick="window.print(); window.close();" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">Print</button>');
        printWindow.document.write('</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
      }
    }

    // Automatically mark order as paid and free table when bill is printed
    if (order && type === "bill") {
      const { updateOrder, updateTableStatus } = useAppStore.getState();
      updateOrder(order.id, { status: "paid" });
      updateTableStatus(order.tableNumber, "available");
      // Close the dialog after printing
      setTimeout(() => {
        onClose();
      }, 500);
    }
  };

  if (!order) return null;

  const tax = order.total * 0.08; // 8% tax
  const grandTotal = order.total + tax;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {type === "kitchen" ? "Kitchen Order" : "Customer Bill"}
          </h2>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="outline" onClick={handlePrint}>
              <Printer size={16} />
            </Button>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        <div ref={printRef} className="print-content mt-4">
          <div className="header">
            <div className="title">خۆشخۆر</div>
            <div className="subtitle">
              {type === "kitchen" ? "KITCHEN ORDER" : "CUSTOMER RECEIPT"}
            </div>
          </div>

          <div className="info">
            <div className="info-row">
              <span className="info-label">Order #:</span>
              <span>#{order.id}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Table:</span>
              <span>{order.tableNumber}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Time:</span>
              <span>{formatDate(order.timestamp)}</span>
            </div>
            {type === "kitchen" && (
              <div className="info-row">
                <span className="info-label">Status:</span>
                <span>{order.status.toUpperCase()}</span>
              </div>
            )}
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                {type === "bill" && <th style={{ textAlign: 'right' }}>Price</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => {
                const menuItem = getMenuItemById(item.menuItemId);
                return (
                  <tr key={item.id}>
                    <td>
                      {menuItem?.name || "Unknown Item"}
                      {item.specialRequests && (
                        <div style={{ fontSize: '12px', fontStyle: 'italic' }}>
                          Note: {item.specialRequests}
                        </div>
                      )}
                    </td>
                    <td>{item.quantity}</td>
                    {type === "bill" && (
                      <td style={{ textAlign: 'right' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {type === "bill" && (
            <div>
              <div className="info-row total-row">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          )}

          <div className="notes">
            {type === "bill" ? (
              <>Thank you for dining with us!<br/>خۆشخۆر</>
            ) : (
              <>Please prepare this order as soon as possible.</>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}