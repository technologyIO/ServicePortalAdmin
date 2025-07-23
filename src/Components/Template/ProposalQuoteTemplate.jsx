import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";

const ProposalQuoteTemplate = () => {
  const { proposalId } = useParams();
  const [quoteData, setQuoteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/phone/proposal/${proposalId}`
        );
        setQuoteData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quote data:", error);
        setLoading(false);
      }
    };
    fetchQuoteData();
  }, [proposalId]);

  const handleDownloadPDF = async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;

      const pages = [...document.querySelectorAll(".pdf-page")].filter(
        (el) => el.offsetHeight > 0 && el.offsetWidth > 0
      );

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const canvas = await html2canvas(pages[i], {
          scale: 1.5, // Better quality than 1.2, not as heavy as 2
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.75); // Slightly better JPEG quality
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const yPosition =
          imgHeight < pageHeight ? (pageHeight - imgHeight) / 2 : 0;

        pdf.addImage(
          imgData,
          "JPEG",
          0,
          yPosition,
          imgWidth,
          Math.min(imgHeight, pageHeight)
        );
      }

      pdf.save(
        `${quoteData?.proposalNumber || "Proposal"}-Rev${
          quoteData?.currentRevision || 0
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN").format(amount);
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const convertToWords = (amount) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convertHundreds = (num) => {
      let result = "";
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " Hundred ";
        num %= 100;
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " ";
        num %= 10;
      } else if (num >= 10) {
        result += teens[num - 10] + " ";
        return result;
      }
      if (num > 0) {
        result += ones[num] + " ";
      }
      return result;
    };

    if (amount === 0) return "Zero Only";

    let crores = Math.floor(amount / 10000000);
    let lakhs = Math.floor((amount % 10000000) / 100000);
    let thousands = Math.floor((amount % 100000) / 1000);
    let remainder = amount % 1000;

    let result = "";
    if (crores > 0) result += convertHundreds(crores) + "Crore ";
    if (lakhs > 0) result += convertHundreds(lakhs) + "Lakh ";
    if (thousands > 0) result += convertHundreds(thousands) + "Thousand ";
    if (remainder > 0) result += convertHundreds(remainder);
    return result.trim() + " Only";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading quote data...</div>
      </div>
    );
  }

  if (!quoteData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">Failed to load quote data</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-400 min-h-screen overflow-y-auto">
      <div className=" w-[300px] fixed top-10  px-4">
        <button
          onClick={handleDownloadPDF}
          className="w-full bg-black text-white font-bold py-3 px-6 rounded shadow-lg hover:bg-gray-800 transition duration-200"
          disabled={loading}
        >
          {loading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>
      <style>
        {`
          /* For Chrome, Edge, and Safari */
          ::-webkit-scrollbar {
            width: 12px;
          }

          ::-webkit-scrollbar-track {
            background: #E5E7EB;
          }

          ::-webkit-scrollbar-thumb {
            background-color: #4B5563;
            border-radius: 6px;
            border: 3px solid #E5E7EB;
          }

          /* Ensure text is selectable */
          .pdf-page {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }

          /* Fixed page dimensions */
          .pdf-page {
            width: 210mm;
            min-height: 297mm;
            max-height: 297mm;
            margin: 0 auto 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            page-break-after: always;
            display: flex;
            flex-direction: column;
          }

          .page-header {
            flex-shrink: 0;
            border-bottom: 2px solid #d1cece;
            padding: 20px;
          }

          .page-content {
            flex: 1;
            padding: 24px;
            overflow: hidden;
          }

          .page-footer {
            flex-shrink: 0;
            border-top: 2px solid #d1cece;
            padding: 12px;
            margin-top: auto;
          }

          @media print {
            .pdf-page {
              page-break-after: always;
              margin: 0;
              box-shadow: none;
            }
          }

          .selectable-text {
            -webkit-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
          }
        `}
      </style>

      <div className="max-w-4xl mx-auto text-black py-4">
        {/* Page 1 - Header and Letter Content */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs leading-relaxed space-y-1 font-bold selectable-text">
                  <p>
                    Ref #: {quoteData.proposalNumber} Rev-
                    {quoteData.currentRevision}
                  </p>
                  <p>Date - {formatDate(quoteData.createdAt)}</p>
                  <p>
                    Complaint ID: {quoteData._id}
                  </p>
                  <p>Serial Number: {quoteData.proposalNumber}</p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Customer Details */}
            <div className="mb-6 selectable-text">
              <div className="font-bold text-base mb-1">
                {quoteData.customer.customername}
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {quoteData.customer.city} - {quoteData.customer.postalcode}
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-4 text-sm leading-relaxed selectable-text">
              <p>
                <strong>Dear Sir/ Madam,</strong>
              </p>

              <p className="font-semibold">
                <strong>
                  Subject: Your requirement of{" "}
                  {quoteData.items
                    ?.map((item) => item.equipment.materialdescription)
                    .join(", ")}
                </strong>
              </p>

              <p>
                Thank you for your interest in Skanray's products. We are
                confident that our products will satisfy your clinical
                requirements.
              </p>

              <p>
                In line with your requirements, we are pleased to herewith
                submit our offer for the following:
              </p>

              <ol className="list-decimal pl-6 space-y-1">
                {quoteData.items?.map((item, index) => (
                  <li key={item._id} className="pl-2">
                    {item.equipment.materialdescription} - {item.warrantyType} for {item.years} years
                  </li>
                ))}
              </ol>

              <p>The offer document has the following enclosures</p>

              <ol className="list-decimal pl-6 space-y-1">
                <li className="pl-2">Product Brochure</li>
                <li className="pl-2">Commercial Offer</li>
                <li className="pl-2">Technical Specifications</li>
                <li className="pl-2">Scope of supply</li>
                <li className="pl-2">Terms and Conditions</li>
              </ol>

              <p>
                We sincerely hope that this offer is in line with your
                requirements. For further clarifications and information, we
                will be glad to furnish you with the same.
              </p>

              <p>
                We look forward to your valued order and long term relationship.
              </p>

              <p>Assuring you of our best services at all times.</p>

              {/* Signature Section */}
              <div className="mt-8 space-y-2">
                <p>
                  <strong>Yours truly,</strong>
                </p>
                <p>
                  <strong>Skanray Technologies Limited</strong>
                </p>
                <div className="mt-4">
                  <p className="font-semibold">Sales Representative</p>
                  <p className="text-black">Representative</p>
                  <div className="text-sm mt-1 text-black">
                    *This is an electronically generated quotation, no signature
                    required.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 1 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 2 - Contact Information */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Offer Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4">Offer for</h2>
              <ol className="list-decimal text-sm space-y-2 ml-6">
                {quoteData.items?.map((item, index) => (
                  <li key={item._id} className="pl-1">
                    {item.equipment.materialdescription} - {item.warrantyType} for {item.years} years
                  </li>
                ))}
              </ol>
            </div>

            {/* Contact Section */}
            <div className="mb-8 selectable-text">
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <div className="space-y-1 text-sm">
                <p className="font-semibold">Sales Representative</p>
                <p>{quoteData.customer.telephone}</p>
                <p className="text-black underline">
                  {quoteData.customer.email}
                </p>
              </div>
            </div>

            {/* Additional Information */}
            <div className="text-sm leading-relaxed space-y-3 selectable-text">
              <p>
                For further details on our local sales and services offices
                please visit our website{" "}
                <span className="text-black underline">www.skanray.com</span>
              </p>
              <p>
                You may also call our Toll Free Customer Interaction Centre on{" "}
                <strong>1800-425-7002</strong> between{" "}
                <strong>10AM to 6:45PM</strong> on all weekdays or email your
                queries to{" "}
                <span className="text-black underline">cic@skanray.com</span>
              </p>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 2 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 3 - Commercial Offer */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-center border-2 border-black py-3 bg-gray-50 selectable-text">
                Commercial Offer{" "}
                <span className="text-sm">(All values in Rs)</span>
              </h2>
            </div>

            {/* Commercial Table */}
            <table
              className="w-full border-2 border-black text-xs mb-6 selectable-text"
              style={{ borderCollapse: "collapse" }}
            >
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black px-2 py-2 text-center font-bold w-12">
                    Sno
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold w-24">
                    Material Code
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold">
                    Material Description
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold w-20">
                    Price Per Year
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold w-16">
                    Warranty Type
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold w-12">
                    Years
                  </th>
                  <th className="border border-black px-2 py-2 text-center font-bold w-20">
                    Total Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {quoteData.items?.map((item, index) => (
                  <tr key={item._id}>
                    <td className="border border-black px-2 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                      {item.equipment.materialcode}
                    </td>
                    <td className="border border-black px-2 py-2">
                      {item.equipment.materialdescription}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {formatCurrency(item.pricePerYear)}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                      {item.warrantyType}
                    </td>
                    <td className="border border-black px-2 py-2 text-center">
                      {item.years}
                    </td>
                    <td className="border border-black px-2 py-2 text-right">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Section */}
            <div className="flex justify-end mb-6">
              <div className="w-80 space-y-1 text-sm selectable-text">
                <div className="flex justify-between py-1 border-b border-gray-400">
                  <span className="font-semibold">
                    Sub-total (Ex-works Mysore)
                  </span>
                  <span>{formatCurrency(quoteData.grandSubTotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Discount ({quoteData.discountPercentage}%)</span>
                  <span>-{formatCurrency(quoteData.discountAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black">
                  <span className="font-semibold">Total (Ex-works Mysore)</span>
                  <span>{formatCurrency(quoteData.afterDiscount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Add TDS @ {quoteData.tdsPercentage}%</span>
                  <span>{formatCurrency(quoteData.tdsAmount)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Add GST @ {quoteData.gstPercentage}%</span>
                  <span>{formatCurrency(quoteData.gstAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-black font-bold">
                  <span>Total Price - F.O.R Destination in Indian Rupee</span>
                  <span>{formatCurrency(quoteData.finalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Price in Words */}
            <div className="mb-0 selectable-text">
              <p className="text-sm">
                <span className="font-semibold">
                  Total Price in words - Indian Rupee
                </span>{" "}
                {convertToWords(quoteData.finalAmount)}
              </p>
            </div>

            {/* Notes Section */}
            <div className="text-xs leading-relaxed space-y-0 selectable-text">
              <p className="font-semibold">Note:</p>
              <div className="space-y-0">
                <p>
                  1. Effective from 1st Oct 2020, as per Govt Of India
                  Notification TCS (Tax collection at Source) will be charged if
                  applicable at the rate of 0.1% if PAN / Aadhaar is submitted
                  otherwise 1%.
                </p>
                <p>
                  2. The above prices are in Indian Rupee, & inclusive of
                  currently applicable GST. Any change in these rates at the
                  time of billing, will be extra to your account, at actual.
                </p>
                <p>
                  3. All the orders should be placed on M/s Skanray Technologies
                  Limited., Mysore for supply of goods
                </p>
                <p>
                  4. Payment terms: 100% advance along with confirmed order.
                </p>
                <p>5. Validity: 30 days from the date of offer.</p>
                <p>
                  6. Other Terms & Conditions, as per enclosed Terms &
                  Conditions of Sale (Supply only)
                </p>
              </div>
            </div>

            {/* Payment Details Section */}
            <div className="mt-2 border-2 border-black p-2 selectable-text">
              <h3 className="font-bold text-sm ">Payment Details</h3>
              <div className="text-xs space-y-1">
                <p>
                  <span className="font-semibold">Bank Name:</span> HDFC Bank
                </p>
                <p>
                  <span className="font-semibold">Branch:</span> MID Corporate
                  Branch
                </p>
                <p>
                  <span className="font-semibold">A/C Name:</span> Skanray
                  Technologies Limited
                </p>
                <p>
                  <span className="font-semibold">A/C no:</span> 125001910216
                </p>
                <p>
                  <span className="font-semibold">IFSC Code:</span> HDFC0001250
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 3 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 4 - Technical Specifications */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold selectable-text">
                Technical Specifications
              </h2>
            </div>

            {/* Equipment Items */}
            <div className="space-y-8 selectable-text">
              {quoteData.items?.map((item, index) => (
                <div key={item._id}>
                  <h3 className="text-base font-bold mb-4">
                    {index + 1}. {item.equipment.materialcode} -{" "}
                    {item.equipment.materialdescription}
                  </h3>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 underline">
                      Technical Specifications
                    </h4>
                    <p className="text-sm">
                      {item.equipment.materialdescription} specifications details
                      would be provided here. This is a {item.warrantyType} service
                      contract for {item.years} years.
                    </p>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 underline">
                      Scope of Supply
                    </h4>
                    <p className="text-sm">
                      {item.warrantyType} Service for {item.equipment.materialdescription}
                      for {item.years} years at ₹{formatCurrency(item.pricePerYear)} per year
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold">Note:</p>
                    <p className="text-sm">
                      Service Contract includes preventive maintenance,
                      breakdown support, and genuine spare parts as per
                      service agreement terms.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 4 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 5 - Terms and Conditions */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Title */}
            <div className="mb-6 selectable-text">
              <h2 className="text-xl font-bold mb-2">Terms and Conditions</h2>
              <h3 className="text-base font-semibold mb-2">
                Terms & Conditions of Sale (Supply only)
              </h3>
              <p className="text-sm italic text-black">
                Unless otherwise stated in the quotation
              </p>
            </div>

            {/* Terms Content */}
            <div className="space-y-6 text-sm leading-relaxed selectable-text">
              <div>
                <h4 className="font-bold text-base mb-2">PRICE:</h4>
                <p>
                  Prices quoted are for supply, on FOR destination basis,
                  inclusive of currently applicable GST. Any variation in the
                  above referred taxes will be to your account.
                </p>
                <p className="mt-2">
                  Any entry permit / bay bill / such statutory local
                  permissions, if required, have to be provided to us by your
                  institution, prior to despatch of Goods from our factory at
                  Mysore.
                </p>
                <p className="mt-2">
                  The prices do not include unloading charges at the site and
                  demurrage charges, if any.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-2">VALIDITY:</h4>
                <p>
                  The offer shall be valid for your acceptance for a period of
                  thirty days from the date of quotation and thereafter, subject
                  to our confirmation. Offer would be considered as accepted on
                  receipt, by the supplier, of technically and commercially
                  clear order along with the despatch instructions in writing.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-2">SCOPE:</h4>
                <p>
                  The scope of supply and other terms and conditions of this
                  contract shall be strictly governed by supplier's offer and
                  supplier's acknowledgement of purchaser's order. The purchaser
                  shall be deemed to have understood and agreed to accept the
                  conditions contained herein and the specific terms and
                  conditions contained in the offer.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-base mb-2">PAYMENT TERMS:</h4>
                <p>
                  90% of the order value as advance payment, along with the
                  confirmed order. Balance 10% of the order value will be
                  payable against submission of the Lorry receipt and copy of
                  the Lorry / transporter's receipt, evidencing the movement.
                  Please provide the full address of your bankers in your order.
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 5 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 6 - Additional Terms */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Payment Details Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4">Payment details</h2>
              <div className="text-sm space-y-1">
                <p>
                  <span className="font-semibold">Bank Name:</span> HDFC Bank
                </p>
                <p>
                  <span className="font-semibold">Branch:</span> MID Corporate
                  Branch
                </p>
                <p>
                  <span className="font-semibold">A/C Name:</span> Skanray
                  Technologies Limited
                </p>
                <p>
                  <span className="font-semibold">A/C no:</span> 125001910219
                </p>
                <p>
                  <span className="font-semibold">IFSC Code:</span> HDFC0001250
                </p>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-6 text-sm leading-relaxed selectable-text">
              <div>
                <h3 className="font-bold text-base mb-2">DELIVERY:</h3>
                <p>
                  Shipment of most orders can normally be made, on FOR station
                  of despatch basis, within 4 to 8 weeks from the date of
                  receipt of technically and commercially clear order along with
                  the despatch instructions / agreed advance amount etc.,
                  whichever is later.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2">
                  INSTALLATION / ASSEMBLY - DEMONSTRATION :
                </h3>
                <p>
                  The purchaser shall provide a suitable site, carry out
                  preliminaries connected with installation, civil and
                  structural alterations (as per supplier's specifications) to
                  enable the supplier to install the equipment. Purchaser shall
                  also comply with requirements of Atomic Energy Regulatory
                  Board (AERB) Guidelines for setting up of new diagnostic X-Ray
                  installation.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2">
                  OPERATIONAL REQUIREMENT:
                </h3>
                <p>
                  The Purchaser shall maintain the environmental conditions
                  recommended by the supplier so as to ensure that the equipment
                  does not suffer damage due to humidity, dust, pests, severe
                  temperature etc. The purchaser shall ensure that the equipment
                  is operated, as per the operating instructions and
                  recommendations.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2">
                  AERB GUIDELINES FOR INSTALLATION :
                </h3>
                <p>
                  The Atomic Energy Regulatory Board (AERB) Safety Code
                  AERB/SC/MED-2 for Medical Diagnostic X-Ray Equipment and
                  Installations is applicable for all x-ray installations
                </p>
              </div>

              <div>
                <h3 className="font-bold text-base mb-2">
                  PROCUREMENT APPROVAL:
                </h3>
                <p>
                  End user shall obtain "Permission for Procurement" from AERB
                  through e-LORA web portal.
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 6 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 7 - AERB Guidelines */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Guidelines Reference */}
            <div className="mb-6 text-sm selectable-text">
              <p>Refer "guidelines document for user" under link below</p>
              <p className="text-black underline">
                https://aerb.gov.in/ELORA/PDFs/GuidelinesforUser%20users.pdf
              </p>
              <p className="mt-2">
                No X-Ray machine shall be installed / commissioned unless the
                layout of the proposed X-Ray installation is approved by the
                competent authority.
              </p>
            </div>

            {/* Operational Licenses Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">
                OPERATIONAL LICENSES:
              </h2>

              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  SKANRAY will perform the installation and On-site QA tests.
                  Purchaser shall obtain license to operate within 3 months from
                  completion of installation & On-site QA tests.
                </p>
                <p>
                  After completion of installation & On-site QA tests, end user
                  shall obtain license to use the equipment from AERB before
                  using on actual patients.
                </p>
                <p>For more information, one can log on to</p>
                <p className="text-black underline">
                  www.aerb.gov.in ,
                  https://elora.aerb.gov.in/populateLoginAction.htm
                </p>
              </div>
            </div>

            {/* Warranty Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">WARRANTY:</h2>

              <div className="text-sm leading-relaxed space-y-3">
                <p>
                  All goods manufactured by us are guaranteed against defects
                  arising from material or workmanship for a period of 12months
                  from the date of installation or 15 months from the date of
                  shipment, whichever is earlier.
                </p>

                <p className="font-semibold">
                  a)Price of the X-Ray Tube or FFD or HF X-Ray Generators = Rs.
                  X
                </p>
                <p className="font-semibold">
                  b) Un-expired portion of the warranty = X Months
                </p>
                <p className="font-semibold">
                  c) Pro-Rate Credit to be allowed to customer = X x Y
                </p>
                <p className="font-semibold">
                  d) Replacement cost to be borne by customer = a) - c)
                  =Rs._____
                </p>

                <p className="mt-4">
                  The warranty, however does not extend to the following:
                </p>
                <p>
                  For X-Ray machines & Surgical C-Arm units:HT cables and
                  accessories.
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 7 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 8 - Warranty Details */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* Warranty Continuation */}
            <div className="mb-8 selectable-text">
              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  For Patient Monitoring systems: Probes / sensors, Pressure
                  transducers, temperature probes, patient cables, electrodes /
                  leads, ECG connectors.
                </p>

                <p>
                  For Ventilators / Anaesthesia systems: Flow transducer,
                  pressure transducer, heater wires, O2 cells, patient tubes /
                  bellows, batteries & other consumables.
                </p>
              </div>
            </div>

            {/* Post Warranty Service Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">
                Post Warranty Service:
              </h2>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  After completion of warranty period, the equipment can be
                  covered by Annual Maintenance Contract (AMC only) or on the
                  Purchase Order Value + service taxes or Service on Call Basis.
                </p>
              </div>
            </div>

            {/* Liabilities Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">LIABILITIES:</h2>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  Except as otherwise provided explicitly hereinabove, we shall
                  not be liable for any special or consequential damages of any
                  kind or nature, arising out of use of this equipment.
                </p>
              </div>
            </div>

            {/* Exemption Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">EXEMPTION:</h2>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  We shall not be responsible for any failure in performing our
                  obligations, if such non performance is due to reasons beyond
                  our control.
                </p>
              </div>
            </div>

            {/* Agreement Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-lg font-bold mb-4 underline">AGREEMENT:</h2>

              <div className="text-sm leading-relaxed space-y-4">
                <p>
                  The foregoing terms & conditions shall prevail notwithstanding
                  any variations contained in any document received from the
                  customer, unless such variations have been specifically agreed
                  upon in writing by Skanray Technologies Limited.
                </p>
              </div>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 8 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>

        {/* Page 9 - Acceptance */}
        <div className="pdf-page">
          <div className="page-header">
            <div className="flex justify-between items-start">
              <div className="text-xs leading-relaxed space-y-1 font-bold text-black selectable-text">
                <p>
                  Ref #: {quoteData.proposalNumber} Rev-
                  {quoteData.currentRevision}
                </p>
                <p>Date - {formatDate(quoteData.createdAt)}</p>
                <p>Form No {quoteData._id}</p>
                <p>Opportunity Number : {quoteData.proposalNumber}</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-[130px] h-[130px] bg-white flex items-center justify-center overflow-hidden">
                  <img
                    src="/Skanray-logo.png"
                    alt="Skanray Logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="page-content">
            {/* INVOICING Section */}
            <div className="mb-8 selectable-text">
              <h2 className="text-base font-bold mb-4">INVOICING:</h2>
              <p className="text-sm leading-relaxed mb-6">
                Invoicing can be raised through Skanray authorized stockist or
                distributor based on the availability of the goods.
              </p>
            </div>

            {/* Order Statement Box */}
            <div className="border-2 border-black p-4 mb-8 selectable-text">
              <p className="text-sm leading-relaxed">
                The undersigned hereby orders the afore-mentioned goods from
                Skanray Technologies Limited. The goods specified above to be
                delivered as per the conditions of sales and terms of business
                set out in this contract.
              </p>
            </div>

            {/* Acceptance Section */}
            <div className="mt-12 selectable-text">
              <h3 className="text-base font-semibold text-center mb-8">
                Acceptance
              </h3>

              {/* Signature Table */}
              <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                  <tr>
                    <td className="border border-black p-4 text-center w-1/2 h-20">
                      <div className="h-12"></div>
                    </td>
                    <td className="border border-black p-4 text-center w-1/2 h-20">
                      <div className="h-12"></div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 text-center font-medium">
                      Customer's signature and seal
                    </td>
                    <td className="border border-black p-3 text-center font-medium">
                      Accepted on behalf of Skanray Technologies
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black p-3 text-center">
                      Date: ________________
                    </td>
                    <td className="border border-black p-3 text-center">
                      Date: ________________
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="page-footer">
            <div className="text-center text-[11px] text-black leading-tight space-y-1 selectable-text">
              <p>Page 9 of 9</p>
              <p>
                <strong>Skanray Technologies Limited</strong>, Regd. Office:
                Plot #15-17, Hebbal Industrial Area, Mysuru - 570016, INDIA. P
                +91 8212415559 CIN U72200KA2007PLC041774
              </p>
              <p>
                Healthcare Division: #360, KIADB Industrial Area, Hebbal, Mysuru
                - 570018, INDIA. P +91 8212407000 E office@skanray.com W
                www.skanray.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button */}
    </div>
  );
};

export default ProposalQuoteTemplate;
