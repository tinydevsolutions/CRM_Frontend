import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data } = await api.get("/finance");
        const found = data.find(i => i._id === id);
        setInvoice(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInvoice();
  }, [id]);

  if (!invoice) return <div className="p-10 text-center" style={{ color: '#374151' }}>Loading Invoice...</div>;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const amountPaid = invoice.amountPaid || 0;
  const pending = invoice.amount - amountPaid;

  return (
    <div style={{ backgroundColor: '#f4f4f5', minHeight: '100vh', padding: '2rem 0' }}>
      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            @page { margin: 20mm; }
            body, html, #root { background-color: white !important; }
            .printable-wrapper { padding: 0 !important; margin: 0 !important; box-shadow: none !important; }
          }
           .print-heading { color: #111827 !important; }
           .print-border-dark { border-color: #111827 !important; }
           .print-text { color: #374151 !important; }
           .print-border-light { border-color: #d1d5db !important; }
           * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        `}
      </style>

      {/* Print Controls */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end no-print px-4">
        <button 
          onClick={() => window.print()} 
          style={{ backgroundColor: '#4f46e5', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
           🖨️ Print as PDF
        </button>
      </div>

      <div className="printable-wrapper max-w-4xl mx-auto font-sans shadow-lg" style={{ padding: '3rem', backgroundColor: 'white' }}>
        {/* Header Container */}
        <div className="flex justify-between items-start border-b-2 print-border-dark pb-12 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight" style={{ color: '#4f46e5' }}>INVOICE</h1>
            <p className="mt-2 print-heading font-bold">#INV-{invoice._id.substring(0, 6).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold print-heading">Tiny Dev Solutions</h2>
            <p className="print-text text-sm mt-1">35/4 Sri Ganesh Apartment</p>
            <p className="print-text text-sm">Kerala Samaj Pollachi</p>
            <div className="mt-3 inline-block border print-border-light px-3 py-1 rounded text-xs font-bold print-text">
              Udyam No: UDYAM-TN-03-03170841
            </div>
            <div className="mt-1 inline-block border print-border-light px-3 py-1 rounded text-xs font-bold print-text ml-2">
              DUNS: 772366528
            </div>
          </div>
        </div>

        <div className="flex justify-between mb-16 px-2">
          <div>
            <p className="text-sm font-bold print-heading uppercase tracking-wider mb-2">Billed To:</p>
            <h3 className="text-lg font-bold print-heading">{invoice.client?.name || "Client Name"}</h3>
            <p className="print-text">{invoice.client?.company || ""}</p>
            <p className="print-text">{invoice.client?.email || ""}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold print-heading uppercase tracking-wider mb-2">Invoice Details:</p>
            <p className="print-text"><span className="font-bold print-heading">Date Issued:</span> {new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p className="print-text"><span className="font-bold print-heading">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p className="print-text"><span className="font-bold print-heading">Status:</span> <span className="font-bold print-heading">{invoice.status}</span></p>
          </div>
        </div>

        <table className="w-full text-left mb-16 border-collapse">
          <thead>
            <tr className="border-y-2 print-border-dark">
              <th className="py-4 px-4 font-bold w-2/3 print-heading">Item Description</th>
              <th className="py-4 px-4 font-bold text-right print-heading">Amount</th>
            </tr>
          </thead>
          <tbody className="print-border-light border-b">
            <tr>
              <td className="py-6 px-4">
                <p className="font-bold text-lg print-heading">{invoice.description}</p>
              </td>
              <td className="py-6 px-4 text-right text-lg font-bold print-heading">
                {formatCurrency(invoice.amount)}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end pt-6 border-t-2 print-border-dark">
          <div className="w-2/3 p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="print-heading font-medium">Subtotal</span>
              <span className="print-heading font-bold">{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between items-center mb-2 text-green-700">
              <span className="print-heading font-medium text-green-700">Amount Paid (Advance)</span>
              <span className="print-heading font-bold text-green-700">-{formatCurrency(amountPaid)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b-2 print-border-dark">
              <span className="print-heading font-medium">Tax</span>
              <span className="print-heading font-medium">Not Applicable</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold print-heading">Total Due</span>
              <span className="text-2xl font-black" style={{ color: pending > 0 ? '#dc2626' : '#16a34a' }}>{formatCurrency(pending)}</span>
            </div>
          </div>
        </div>

        <div className="mt-24 text-center text-[15px] font-bold print-text border-t-2 print-border-dark pt-8">
          <p>Thank you for doing business with Tiny Dev Solutions.</p>
          <p>Please remit your pending balance of {formatCurrency(pending)} within the specified due date.</p>
        </div>
      </div>
    </div>
  );
}
