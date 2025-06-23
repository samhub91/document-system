// Import React and CSS
import React, { useEffect, useState } from "react";
import '../index.css';

function DocumentForm() {
  // State for form fields
  const [formData, setFormData] = useState({ 
    name: "", phone: "", id_number: "", service: "", service_type: "", comment: "" 
  });

  // State for search input
  const [searchTerm, setSearchTerm] = useState("");

  // State for all submissions (from localStorage)
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem("submissions");
    return saved ? JSON.parse(saved) : [];
  });

  // State for filtered submissions (search results)
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);

  // State for which client row is expanded in the table
  const [expandedClientId, setExpandedClientId] = useState(null);

  // State for search suggestions (autocomplete)
  const [suggestions, setSuggestions] = useState([]);

  // State for which checklist items are checked in the form
  const [checkedDocs, setCheckedDocs] = useState([]);

  // State for document stage (progress) in the form
  const initialStage = { Submitted: true, 'In-Review': false, Processed: false, Collected: false };
  const [documentStage, setDocumentStage] = useState(initialStage);

  // State for manual checklist (progress bar) in client details
  const [checklistStatuses, setChecklistStatuses] = useState({});

  // Effect: Clear filteredSubmissions when searchTerm is cleared
  useEffect(() => {
    if (searchTerm.trim() === "") setFilteredSubmissions([]);
  }, [searchTerm]);

  // Effect: Save submissions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("submissions", JSON.stringify(submissions));
  }, [submissions]);

  // Effect: Reset documentStage when service or type changes
  useEffect(() => {
    setDocumentStage({ ...initialStage, Submitted: true }); // Always checked by default
  }, [formData.service, formData.service_type]);

  // Effect: Show suggestions as user types
  useEffect(() => {
    if (searchTerm.trim()) {
      const prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      setSuggestions(prev.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  // All services and their required document checklists
  const services = {
    dlRecordUpdates: {
      label: "DL Record Updates",
      types: {
        updateRecord: {
          label: "Record Update",
          checklist: [
            "Fill form.",
            "Provide proof of identification.",
            "Other related documents."
          ],
        },
      },
    },
    forcedTransfer: {
      label: "Forced Transfer",
      types: {
        bankRepossession: {
          label: "Bank Repossession Auction",
          checklist: [
            "Certfied Copy of Valid Auctioneer License",
            "Auctioneer registration certificate and PIN for auctioned vehicles.",
            "Tender documents for tendered motor vehicle.",
            "A letter of instruction issued by financial institution appointing the auctioneer.",
            "Certificate of sale.",
            "Original Purchase receipt.",
            "Certficate of incorporation for the bank and auctioneer.",
            "KRA pin for Auctioneer and bank.",
            "Letter from the bank showing the highest bidder.",
            "Sworn affidavit for the applicant.",
            "Tape lift from DCI.",
            "Transfer form (Form C).",
            "Newspaper Advert."
          ],
        },
        policeAuctions: {
          label: "Police/Uncollected Property Auctions",
          checklist: [
            "A certified copy of valid Auctioneer license.",
            "Auctioneer registration certificate and pin.",
            "Certificate of sale.",
            "Original purchase receipt.",
            "Gazette notice and/or newspaper advert.",
            "Sworn affidavit for the applicant.",
            "Tape lift from DCI.",
            "Properly filled & Stamped form C by the Auctioneer.",
            "A copy of the list of the vehicles disposed from the police.",
            "Official letter for request of transfer.",
            "Court order authorizing the auction."
          ],
        },
        transferByCourtOrder: {
          label: "Transfer by Court Order",
          checklist: [
            "Sworn Affidavit for the applicant.",
            "KRA PIN and ID of new owner.",
            "Tape Lift from DCI.",
            "Transfer form (Form C).",
            "Official letter for request of transfer.",
            "Court order.",
            "Original Logbook."
          ],
        },
        successionCase: {
          label: "Succession Case",
          checklist: [
            "A certified copy of the certificate of grants and the schedule of properties.",
            "Letter appointing administrators of the estate.",
            "Original Registration Certificate (logbook) or Police Abstract.",
            "Official letter for request of transfer.",
            "Certified copy of the death certificate by CRS.",
            "Tape lift from DCI.",
            "Transfer form (Form C).",
            "Sworn Affidavit from the successor.",
            "KRA PIN and ID of new owner."
          ],
        },
        distressForRentAuction: {
          label: "Distress for Rent Auction",
          checklist: [
            "Original logbook/police abstract.",
            "Properly filled form C stamped by the auctioneer.",
            "Tape Lift from DCI.",
            "Sworn Affidavit from a magistrate/advocate.",
            "Copy of ID & KRA PIN of both new and previous owners.",
            "Certificate of registration and KRA PIN of the Company.",
            "Copy of Auctioneers license and registration certificate.",
            "Certificate of sale."
          ],
        },
        diplomatToEmbassy: {
          label: "Diplomat to Embassy",
          checklist: [
            "Request Letter (written by Embassy/mission).",
            "Form A approved by ministry.",
            "Form C approved by ministry.",
            "Customs Entry and duty payment receipt.",
            "Diplomatic ID for both buyer and seller.",
            "KRA PIN for both buyer and seller.",
            "PRO 1 B Form.",
            "Pro 1C Form.",
            "Organisation / Embassy PIN.",
            "Original Logbook."
          ],
        },
        previousVehicleOwnerMissingOrAbsent: {
          label: "Previous Vehicle Owner Missing or Absent",
          checklist: [
            "A copy of ID of incorporation of the registered and new owner.",
            "Sworn Affidavit for the applicant.",
            "Tape Lift from DCI.",
            "Seller agreement with signed Form C duly filled by the registered owner.",
            "Official letter for request of transfer.",
            "Original Logbook or Police Abstract.",
            "KRA PIN Certificate of the registered and the new owner.",
            "Court Order."
          ],
        },
      },
    },
    reRegistration: {
      label: "Re-Registration Services",
      types: {
        exGK: {
          label: "Re-Registration of EX-GK Vehicles, GK and County Governments.",
          checklist: [
            "Application Form A.",
            "GK number plate / Retention letter.",
            "GK Registration certificate.",
            "Application Form C.",
            "Valid Auctioneers License.",
            "KRA PIN and Certificate of Incorporation.",
            "Copies of KRA PIN Certificate and National ID of the buyer.",
            "Tape lift of the chassis and engine numbers from the DCI.",
            "New entry form after paying duty for those whose duty was not paid."
          ],
        },
        exDiplomatToDiplomat: {
          label: "Re-Registration of EX-Diplomat TO Diplomat Vehicles",
          checklist: [
            "Form A approved by the Ministry of Foreign Affairs.",
            "Form C approved by the Ministry of Foreign Affairs.",
            "Original Customs entry (Form C 17B).",
            "Original KRA Payment Receipt.",
            "Original Logbook.",
            "Pro 1 B.",
            "Pro 1 C.",
            "KRA PIN of the Buyer.",
            "KRA PIN of the Seller.",
            "Diplomatic ID of the Buyer.",
            "Diplomatic ID of the Seller."
          ],
        },
        exDiplomatToDiplomatMission: {
          label: "Re-Registration of Ex-Diplomat to Diplomat (Mission) Vehicles",
          checklist: [
            "Filled Form A approved by the Ministry of Foreign Affairs.",
            "Filled Form C approved by the Ministry of Foreign Affairs.",
            "Original Customs entry.",
            "Original Payment receipt.",
            "Original approved PRO 1B.",
            "Original approved PRO 1C.",
            "Original Logbook.",
            "KRA PIN of the Buyer and Seller.",
            "Valid Diplomatic ID of the Buyer and Seller.",
            "Surrender of Plates at the collection point."
          ],
        },
        exCivilianToGK: {
          label: "Re-Registration of EX-CIVILIAN TO GK",
          checklist: [
            "If the vehicle is a donation, a letter from the donor is required.",
            "Request letter on the conversion.",
            "Tape Lift of Chassis and Engine Numbers from DCI.",
            "Copies of PIN and certificate of incorporation for both organizations.",
            "Original Certificate of registration.",
            "Surrender of Plates at the Collection point."
          ],
        },
        exDiplomatsToParastatal: {
          label: "Re-Registration of EX-DIPLOMATS TO PARASTATALS/GOVERNMENT",
          checklist: [
            "Release letter from the Diplomatic organization.",
            "Acceptance letter and request for re-registration from the Parastatal/G.K.",
            "Tape Lift of Chassis and Engine Numbers from DCI.",
            "Original Logbook.",
            "Entry and payment Receipt.",
            "New entry and exemption from the National Treasury.",
            "Certificate of incorporation of the seller.",
            "KRA PIN of the buyer.",
            "Surrender of Plates at the collection point."
          ],
        },
        exCivilianToDiplomat: {
          label: "Ex-Civilian to Diplomat Re-Registration ",
          checklist: [
            "Form A approved by the Ministry of Foreign Affairs.",
            "Form C (Original customs entry Duty Paid).",
            "Original Logbook.",
            "Tape Lift of Chassis and Engine Numbers from DCI.",
            "KRA PIN of the Buyer.",
            "Diplomatic ID of the Buyer.",
            "National ID/Certificate of Incorporation (Seller).",
            "Surrender of Plates at the collection point."
          ],
        },
        civilianVehicleReRegistration: {
          label: "Civilian Vehicle Re-Registration",
          checklist: [
            "Request letter providing reasons.",
            "DCI report on the owner.",
            "Original Certificate of registration or Police Abstract.",
            "Tape Lift of Chassis and Engine Numbers from DCI.",
            "KRA PIN of the motor vehicle owner.",
            "National ID of the motor-vehicle-owner."
          ],
        },
        exCivilianToParastatal: {
          label: "Re-Registration of EX-CIVILIAN TO PARASTATAL/GOVERNMENT/COUNTY/GOVERNMENT",
          checklist: [
            "Release letter from the organization.",
            "Acceptance letter and request for re-registration form.",
            "Tape Lift of Chassis and Engine Numbers from DCI.",
            "Original Logbook.",
            "Duty paid entry.",
            "Certificate of incorporation of the seller (organization).",
            "KRA PIN of the buyer.",
            "Surrender of Plates at the collection point."
          ],
        },
        exDiplomatToCivilian: {
          label: "Ex-Diplomats to Civilian Re-Registration ",
          checklist: [
            "Form A approved by the Ministry of Foreign Affairs.",
            "Form C approved by the Ministry of Foreign Affairs.",
            "Original custom entry (Form C 17B) duty paid.",
            "Original Pro 1C/DA1.",
            "KRA Payment Receipt.",
            "Original Logbook.",
            "KRA Pin Seller.",
            "Diplomatic ID Seller.",
            "National ID/Allien Card Buyer.",
            "Surrender of Plates Letter."
          ],
        },
      },
    },
    caveat: {
      label: "Caveat Services",
      types: {
        placingCaveat: {
          label: "Placing of Caveat Service",
          checklist: [
            "Valid Court orders.",
            "Request by registered owner.",
            "Request by relevant Government Agencies (DTI, KRA, EACC).",
            "The legal spouse of the registered owner with marriage certificate.",
            "An appointed legal representative.",
            "An appointed administrator."
          ],
        },
        liftingCaveat: {
          label: "Lifting of Caveat Section",
          checklist: [
            "Application for lifting caveat.",
            "Supporting documents.",
            "Approval from concerned department."
          ],
        },
      },
    },
    addOrganization: {
      label: "Add Organization",
      types: {
        add: {
          label: "Add Organization",
          checklist: [
            "Registration certificate.",
            "Approval form.",
            "Other relevant documents."
          ],
        },
      },
    },
  };

  // Save search term to localStorage for suggestions
  const saveSearchTerm = (term) => {
    if (!term) return;
    let prev = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    if (!prev.includes(term)) {
      prev = [term, ...prev].slice(0, 10); // keep last 10
      localStorage.setItem('searchHistory', JSON.stringify(prev));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Generate serial number in format NTSA-YYYY-MM-DD-XXX
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePart = `${year}-${month}-${day}`;
    const submissionNumber = String(submissions.length + 1).padStart(3, '0');
    const serialNumber = `NTSA-${datePart}-${submissionNumber}`;

    // Prepare submission object for backend
    const submission = {
      name: formData.name,
      phone: formData.phone,
      id_number: formData.id_number,
      service: formData.service,
      service_type: formData.service_type,
      comment: formData.comment,
      serialNumber,
      checked_documents: checkedDocs.map(idx =>
        services[formData.service]?.types?.[formData.service_type]?.checklist[idx]
      ),
      document_stage: { ...documentStage, Submitted: true }
    };

    try {
      const response = await fetch("http://localhost/document-system/api.1/submit.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission)
      });
      const result = await response.json();
      if (result.success) {
        // Add to local state/localStorage only if backend succeeded
        const newSubmission = {
          id: Date.now(),
          ...submission
        };
        setSubmissions((prev) => [...prev, newSubmission]);
        setFormData({ 
          name: "", 
          phone: "", 
          id_number: "", 
          service: "", 
          service_type: "", 
          comment: "" 
        });
        alert("Form submitted!");
        setCheckedDocs([]);
        setDocumentStage({ ...initialStage, Submitted: true });
      } else {
        alert("Submission failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error submitting form. Please try again.");
      console.error("Submit error:", err);
    }
  };

  // Handle search (API + local)
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term.");
      return;
    }
    saveSearchTerm(searchTerm.trim());

    try {
      const local = JSON.parse(localStorage.getItem("submissions")) || [];

      const response = await fetch("http://localhost/document-system/api.1/search.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm.trim() }),
      });

      const result = await response.json();
      console.log("Search API response:", result); // 👈 See what came back

      const localMatches = local.filter(
        (item) =>
          item.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (result.success) {
        const merged = [
          ...result.data,
          ...localMatches.filter(
            (localItem) =>
              !result.data.some(
                (dbItem) =>
                  dbItem.id_number === localItem.id_number &&
                  dbItem.name === localItem.name
              )
          ),
        ];

        setFilteredSubmissions(merged);
      } else {
        alert("Search failed: " + result.message);
        setFilteredSubmissions([]);
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Something went wrong during search.");
      setFilteredSubmissions([]);
    }
  };

  // List all records
  const handleListAll = async () => {
    try {
      const response = await fetch("http://localhost/document-system/api.1/search.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "__ALL__" }) // special query to list all
      });
      const result = await response.json();
      if (result.success) {
        // Show newest first (no reverse needed, backend already orders DESC)
        setFilteredSubmissions(result.data);
      } else {
        alert("Failed to list all: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      alert("Error listing all. Please try again.");
      console.error("List all error:", err);
    }
  };

  // Clear search and results
  const handleClearList = () => {
    setFilteredSubmissions([]);
    setSearchTerm(""); // clear search input
  };

  // --- RENDER ---
  return (
    <div className="document-form-container">
      {/* --- FORM --- */}
      <form className="document-form" onSubmit={handleSubmit}>
        <div className="heading">
                 <h2>Document Management / Checklist</h2>
        </div>

        {/* Name */}
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />

        {/* Phone Number */}
        <label htmlFor="phone">Client's Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={(e) =>
            setFormData({ ...formData, phone: e.target.value })
          }
          required
        />

        {/* ID Number */}
        <label htmlFor="id_number">Client's ID Number</label>
        <input
          id="id_number"
          name="id_number"
          type="text"
          value={formData.id_number}
          onChange={(e) =>
            setFormData({ ...formData, id_number: e.target.value })
          }
          required
        />

        {/* Services */}
        <label htmlFor="service">Select Service</label>
        <select
          id="service"
          name="service"
          value={formData.service}
          onChange={(e) =>
            setFormData({ ...formData, service: e.target.value, service_type: '' })
          }
          required
        >
          <option value="">Select a service</option>
          {Object.entries(services).map(([key, service]) => (
            <option key={key} value={key}>
              {service.label}
            </option>
          ))}
        </select>

        {/* Service Type */}
        {formData.service &&
          services[formData.service]?.types && (
            <>
              <label htmlFor="service_type">Select Type</label>
              <select
                id="service_type"
                name="service_type"
                value={formData.service_type}
                onChange={(e) =>
                    setFormData({ ...formData, service_type: e.target.value })
                }
                required
              >
                <option value="">Select a Type</option>
                {Object.entries(services[formData.service].types).map(([key, type]) => (
                    <option key={key} value={key}>
                    {type.label}
                    </option>
                ))}
              </select>
            </>
          )}

        {/* Checklist for required documents */}
        {formData.service &&
          formData.service_type &&
          services[formData.service]?.types?.[formData.service_type]?.checklist?.length > 0 && (
            <ul className="checklist">
              <h4>Please make sure you have the following documents:</h4>
              {services[formData.service].types[formData.service_type].checklist.map((item, index) => (
                <li key={index}>
                  <input
                    id={`${formData.service_type}_${index}`}
                    type="checkbox"
                    name={`${formData.service_type}_${index}`}
                    checked={checkedDocs.includes(index)}
                    onChange={e => {
                      setCheckedDocs(prev =>
                        e.target.checked
                          ? [...prev, index]
                          : prev.filter(i => i !== index)
                      );
                    }}
                  />
                  <label htmlFor={`${formData.service_type}_${index}`}>{item}</label>
                </li>
              ))}
            </ul>
          )}
        {/* Comments */}
        <label htmlFor="comment">Comment</label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={(e) =>
            setFormData({ ...formData, comment: e.target.value })
          }
        />

        {/* Submit Button */}
        <button type="submit" className="styled-btn">Submit</button>
        
      </form>

      {/* --- SEARCH BAR --- */}
      <div className="search-container">
        <div style={{ position: 'relative', display: 'inline-block', width: '550px', maxWidth: '100%' }}>
          <input
            type="text"
            placeholder="Search by Client Name, Serial Number or ID Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="search-input"
            autoComplete="off"
            style={{ paddingRight: '2.5rem', width: '100%', fontSize: '1rem', borderRadius: '20px', border: '1px solid #ccc', height: '2.5rem', boxSizing: 'border-box' }}
          />
          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((s, i) => (
                <li key={s} onClick={() => setSearchTerm(s)}>{s}</li>
              ))}
            </ul>
          )}
        </div>
        <button type="button" className="styled-btn" onClick={handleListAll}>List</button>
        <button type="button" className="styled-btn" onClick={handleClearList}>Clear</button>
      </div>

      {/* --- SUBMISSIONS TABLE --- */}
      <h2 className="client-table">Client Submissions</h2>
      <table className="submissions-table">
        <thead>
          <tr>
              <th>Serial Number</th>
              <th>Client Name</th>
              <th>ID Number</th>
              <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubmissions.map((item) => (
            <React.Fragment key={item.id}>
              {/* Summary row */}
              <tr>
                <td>{item.serialNumber}</td>
                <td>{item.ownerName}</td>
                <td>{item.idNumber}</td>
                <td>
                  <button onClick={() => setExpandedClientId(item.id)} className="styled-btn">View</button>
                  
                </td>
              </tr>

              {/* Display details directly under the row if it's selected */}
              {expandedClientId === item.id && (
                <tr className="client-details-row">
                  <td colSpan="4">
                    <div className="client-details">
                      <h3>Client Details</h3>
                      <p><strong>Serial Number:</strong>{item.serialNumber}</p>
                      <p><strong>Name:</strong> {item.ownerName}</p>
                      <p><strong>ID Number:</strong> {item.idNumber}</p>
                      <p><strong>Phone Number:</strong> {item.phone}</p>
                      <p><strong>Service:</strong> {item.service}</p>
                      <p><strong>Service Type:</strong> {item.serviceType}</p>
                      <p><strong>Comments:</strong> {item.comments}</p>
                      {item.submittedAt && (
                        <p><strong>Submitted At:</strong> {item.submittedAt}</p>
                      )}
                      {/* Service Document Checklist */}
                      {item.service && item.serviceType && Array.isArray(item.checked_documents) && item.checked_documents.length > 0 && (
                        <>
                          <h4>Submitted Documents</h4>
                          <ul className="checklist">
                            {item.checked_documents.map((doc, idx) => (
                              <li key={idx}>
                                <input
                                  type="checkbox"
                                  checked={true}
                                  readOnly
                                />
                                <label>{doc}</label>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      {/* Manual Checklist Section */}
                      <h4>Document Stage</h4>
                      <ul className="manual-checklist">
                        {Object.keys(initialStage).map((stage) => (
                          <li key={stage}>
                            <input
                              type="checkbox"
                              checked={item.document_stage ? item.document_stage[stage] : stage === 'Submitted'}
                              disabled={stage === 'Submitted'}
                              onChange={async (e) => {
                                // Update document stage locally and send to backend
                                const updatedStage = {
                                  ...item.document_stage,
                                  [stage]: e.target.checked
                                };
                                // Optimistically update UI
                                setFilteredSubmissions((prev) => prev.map((row) =>
                                  row.id === item.id ? { ...row, document_stage: updatedStage } : row
                                ));
                                // Send update to backend
                                await fetch('http://localhost/document-system/api.1/update_stage.php', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ id: item.id, document_stage: updatedStage })
                                });
                              }}
                            />
                            <label>{stage}</label>
                          </li>
                        ))}
                      </ul>
                      <h4>Progress</h4>
                      {(() => {
                        const stageObj = item.document_stage || {};
                        const total = 4;
                        // If nothing is checked, show 0%. If only Submitted is checked, show 25%. Otherwise, show actual percent.
                        const submitted = stageObj['Submitted'] ? 1 : 0;
                        const completed = Object.values(stageObj).filter(Boolean).length;
                        let progress = 0;
                        if (completed === 0) {
                          progress = 0;
                        } else if (completed === 1 && submitted) {
                          progress = 25;
                        } else {
                          progress = (completed / total) * 100;
                        }
                        return (
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}>
                              {Math.round(progress)}%
                            </div>
                          </div>
                        );
                      })()}
                      <button onClick={() => setExpandedClientId(null)} className="styled-btn">Close</button>
                    </div>
                  </td>
                </tr>
              )}
              

            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DocumentForm;
