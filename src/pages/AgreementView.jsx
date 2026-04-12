import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";

export default function AgreementView() {
  const { id } = useParams();
  const [agreement, setAgreement] = useState(null);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const { data } = await api.get(`/agreements/${id}`);
        setAgreement(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgreement();
  }, [id]);

  if (!agreement) return <div className="p-10 text-center" style={{ color: '#374151'}}>Loading Agreement...</div>;

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

      {/* Print Controls (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-4 flex justify-end no-print px-4">
        <button 
          onClick={() => window.print()} 
          style={{ backgroundColor: '#4f46e5', color: 'white', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
           🖨️ Print as PDF
        </button>
      </div>

      <div className="printable-wrapper max-w-4xl mx-auto font-serif shadow-lg" style={{ padding: '3rem', backgroundColor: 'white' }}>
        <div className="text-center pb-12 border-b-2 print-border-dark mb-12">
          <h1 className="text-3xl font-bold uppercase tracking-widest print-heading">Legal Agreement</h1>
          <h2 className="text-xl font-medium mt-2 print-heading">{agreement.title}</h2>
          <div className="mt-6 flex justify-center gap-4">
            <span className="inline-block px-3 py-1 border print-border-light rounded text-xs font-bold print-text font-sans tracking-wide">
              Udyam Registration No: UDYAM-TN-03-03170841
            </span>
            <span className="inline-block px-3 py-1 border print-border-light rounded text-xs font-bold print-text font-sans tracking-wide">
              D-U-N-S Number: 772366528
            </span>
          </div>
        </div>

        <div className="text-[15px] mb-12 leading-relaxed font-sans print-text">
          <p className="mb-4 text-base print-heading font-bold">This Document is Executed Between:</p>
          <div className="flex gap-12">
            <div className="flex-1 p-6 border print-border-light rounded-sm">
              <h3 className="font-bold uppercase text-xs tracking-wider mb-2 print-heading">Service Provider</h3>
              <p className="font-bold text-base print-heading">Tiny Dev Solutions</p>
              <p className="print-text">123 Tech Park, Suite 400</p>
              <p className="print-text">Innovation City, IN 10001</p>
              <p className="mt-2 text-xs font-bold print-heading">MSME Registered</p>
            </div>
            <div className="flex-1 p-6 border print-border-light rounded-sm">
              <h3 className="font-bold uppercase text-xs tracking-wider mb-2 print-heading">Client Details</h3>
              <p className="font-bold text-base print-heading">{agreement.client?.name}</p>
              <p className="print-text">{agreement.client?.company}</p>
              <p className="print-text">{agreement.client?.email}</p>
              <p className="mt-2 text-xs print-text">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="text-[16px] leading-loose text-justify mb-20 print-text font-sans">
          {agreement.content.split(/\r?\n/).map((line, idx) => (
            <p key={idx} className={line.trim() === "" ? "h-5" : "mb-3"}>{line}</p>
          ))}
        </div>

        <div className="mt-20 pt-12 border-t print-border-light flex justify-between font-sans">
          <div className="w-64">
            <p className="font-bold mb-16 text-sm print-heading">Service Provider: Tiny Dev Solutions</p>
            <div className="border-b-2 print-border-dark w-full mb-2"></div>
            <p className="text-xs font-bold print-heading">Authorized Signatory</p>
            <p className="text-xs font-bold print-text mt-1">Date: ________________</p>
          </div>
          <div className="w-64">
             <p className="font-bold mb-16 text-sm print-heading">Client: {agreement.client?.name}</p>
            <div className="border-b-2 print-border-dark w-full mb-2"></div>
            <p className="text-xs font-bold print-heading">Authorized Signatory</p>
             <p className="text-xs font-bold print-text mt-1">Date: ________________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
