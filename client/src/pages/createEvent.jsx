import React, { useState } from 'react';
import { api, API_BASE_URL } from '../api/client';
import '../css/createEvent.css';

export default function Createevent() {
	// local category options - replace or fetch from API if needed
	const CATEGORY_OPTIONS = [
		'TEDx',
		'Health Camp',
		'Concerts',
		'Exhibitions',
	];

	const STATUS_OPTIONS = [
		'upcoming',
		'start_selling',
		'sold_out',
		'ended',
	];
	const [form, setForm] = useState({
		title: '',
		description: '',
		venue: '',
		category: '',
		status: '',
		price: '',
		capacity: '',
		startDateTime: '',
		endDateTime: '',

		// Common organizer details
		orgType: '',
		registeredAddressLine1: '',
		registeredAddressLine2: '',
		registeredCity: '',
		registeredState: '',
		registeredPostalCode: '',
		registeredCountry: '',
		website: '',
		registrationNumber: '',
		yearEstablished: '',
		facebook: '',
		instagram: '',
		twitter: '',
		linkedin: '',
		youtube: '',

		// TEDx
		tedxLicenseId: '',
		tedxLicenseOwnerName: '',
		tedxLicenseOwnerEmail: '',
		tedxLicenseScope: '',
		tedxLicenseExpiryDate: '',
		tedxDocumentLinks: '',

		// Health Camp
		healthOrganizerType: '',
		healthDirectorName: '',
		healthRegistrationNumber: '',
		healthPartnerHospitalName: '',
		healthEmergencyContact: '',
		healthDocumentLinks: '',

		// Concerts
		concertOrganizerType: '',
		concertPrimaryArtists: '',
		concertVenueNameConfirm: '',
		concertVenueCapacityConfirm: '',
		concertAgeRestrictions: '',
		concertDocumentLinks: '',

		// Exhibitions
		exhibitionVenueDetails: '',
		exhibitionHallDetails: '',
		exhibitionKeyExhibitors: '',
		exhibitionDocumentLinks: '',
	});

	const [imagePreview, setImagePreview] = useState(null);
	const [imageBase64, setImageBase64] = useState(null);
	const [imageFile, setImageFile] = useState(null);
	const [errors, setErrors] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState(null);

	function handleChange(e) {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
	}

	function handleFile(e) {
		const file = e.target.files?.[0];
		if (!file) {
			// clear previously selected image / errors
			setImagePreview(null);
			setImageBase64(null);
			setImageFile(null);
			setErrors((s) => ({ ...s, image: undefined }));
			return;
		}

		// accept only jpeg and png
		const allowed = ['image/jpeg', 'image/png'];
		const fileType = (file.type || '').toLowerCase();
		const ext = file.name?.split('.').pop()?.toLowerCase();
		const extOk = ext === 'jpg' || ext === 'jpeg' || ext === 'png';
		if (!allowed.includes(fileType) && !extOk) {
			setImagePreview(null);
			setImageBase64(null);
			setErrors((s) => ({ ...s, image: 'Only JPEG and PNG images are allowed' }));
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			// clear image error (valid file)
			setErrors((s) => ({ ...s, image: undefined }));
			setImagePreview(reader.result);
			setImageBase64(reader.result);
			setImageFile(file);
		};
		reader.readAsDataURL(file);
	}

	function validate() {
		const err = {};
		if (!form.title.trim()) err.title = 'Title is required';
		if (!form.startDateTime) err.startDateTime = 'Start date/time is required';
		if (!form.endDateTime) err.endDateTime = 'End date/time is required';
		// Ensure start is not later than end
		if (form.startDateTime && form.endDateTime) {
			const s = new Date(form.startDateTime);
			const e = new Date(form.endDateTime);
			if (s > e) {
				err.startDateTime = 'Start must be before end';
				err.endDateTime = 'End must be after start';
			}
		}
		if (form.capacity && Number(form.capacity) < 0) err.capacity = 'Capacity cannot be negative';
		if (form.price && Number(form.price) < 0) err.price = 'Price cannot be negative';
		return err;
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setMessage(null);
		const err = validate();
		setErrors(err);
		if (Object.keys(err).length) return;

		setSubmitting(true);
		try {
			// Build multipart/form-data so backend multer can receive file
			const formData = new FormData();
			formData.append('title', form.title);
			formData.append('description', form.description);
			formData.append('venue', form.venue);
			formData.append('category', form.category);
			if (form.status) formData.append('status', form.status);
			if (form.capacity) formData.append('capacity', String(form.capacity));
			if (form.price) formData.append('price', String(form.price));
			if (form.startDateTime) formData.append('startDateTime', form.startDateTime);
			if (form.endDateTime) formData.append('endDateTime', form.endDateTime);

			// Organizer common details
			if (form.orgType) formData.append('orgType', form.orgType);
			if (form.registeredAddressLine1) formData.append('registeredAddressLine1', form.registeredAddressLine1);
			if (form.registeredAddressLine2) formData.append('registeredAddressLine2', form.registeredAddressLine2);
			if (form.registeredCity) formData.append('registeredCity', form.registeredCity);
			if (form.registeredState) formData.append('registeredState', form.registeredState);
			if (form.registeredPostalCode) formData.append('registeredPostalCode', form.registeredPostalCode);
			if (form.registeredCountry) formData.append('registeredCountry', form.registeredCountry);
			if (form.website) formData.append('website', form.website);
			if (form.registrationNumber) formData.append('registrationNumber', form.registrationNumber);
			if (form.yearEstablished) formData.append('yearEstablished', String(form.yearEstablished));
			if (form.facebook) formData.append('facebook', form.facebook);
			if (form.instagram) formData.append('instagram', form.instagram);
			if (form.twitter) formData.append('twitter', form.twitter);
			if (form.linkedin) formData.append('linkedin', form.linkedin);
			if (form.youtube) formData.append('youtube', form.youtube);

			// TEDx-specific
			if (form.tedxLicenseId) formData.append('tedxLicenseId', form.tedxLicenseId);
			if (form.tedxLicenseOwnerName) formData.append('tedxLicenseOwnerName', form.tedxLicenseOwnerName);
			if (form.tedxLicenseOwnerEmail) formData.append('tedxLicenseOwnerEmail', form.tedxLicenseOwnerEmail);
			if (form.tedxLicenseScope) formData.append('tedxLicenseScope', form.tedxLicenseScope);
			if (form.tedxLicenseExpiryDate) formData.append('tedxLicenseExpiryDate', form.tedxLicenseExpiryDate);
			if (form.tedxDocumentLinks) formData.append('tedxDocumentLinks', form.tedxDocumentLinks);

			// Health Camp-specific
			if (form.healthOrganizerType) formData.append('healthOrganizerType', form.healthOrganizerType);
			if (form.healthDirectorName) formData.append('healthDirectorName', form.healthDirectorName);
			if (form.healthRegistrationNumber) formData.append('healthRegistrationNumber', form.healthRegistrationNumber);
			if (form.healthPartnerHospitalName) formData.append('healthPartnerHospitalName', form.healthPartnerHospitalName);
			if (form.healthEmergencyContact) formData.append('healthEmergencyContact', form.healthEmergencyContact);
			if (form.healthDocumentLinks) formData.append('healthDocumentLinks', form.healthDocumentLinks);

			// Concerts-specific
			if (form.concertOrganizerType) formData.append('concertOrganizerType', form.concertOrganizerType);
			if (form.concertPrimaryArtists) formData.append('concertPrimaryArtists', form.concertPrimaryArtists);
			if (form.concertVenueNameConfirm) formData.append('concertVenueNameConfirm', form.concertVenueNameConfirm);
			if (form.concertVenueCapacityConfirm) formData.append('concertVenueCapacityConfirm', form.concertVenueCapacityConfirm);
			if (form.concertAgeRestrictions) formData.append('concertAgeRestrictions', form.concertAgeRestrictions);
			if (form.concertDocumentLinks) formData.append('concertDocumentLinks', form.concertDocumentLinks);

			// Exhibitions-specific
			if (form.exhibitionVenueDetails) formData.append('exhibitionVenueDetails', form.exhibitionVenueDetails);
			if (form.exhibitionHallDetails) formData.append('exhibitionHallDetails', form.exhibitionHallDetails);
			if (form.exhibitionKeyExhibitors) formData.append('exhibitionKeyExhibitors', form.exhibitionKeyExhibitors);
			if (form.exhibitionDocumentLinks) formData.append('exhibitionDocumentLinks', form.exhibitionDocumentLinks);
			if (imageFile) formData.append('image', imageFile);

			// Use fetch here because api.post uses JSON by default. Send credentials so session cookie is included.
			const response = await fetch(`${API_BASE_URL}/organizer/events`, {
				method: 'POST',
				credentials: 'include',
				body: formData,
			});

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create event');
            }else {
                const data = await response.json();
                console.log('Event created:', data);
            }


			setMessage({ type: 'success', text: 'Event created successfully' });
			setForm({
				title: '',
				description: '',
				venue: '',
				category: '',
				status: '',
				price: '',
				capacity: '',
				startDateTime: '',
				endDateTime: '',
				orgType: '',
				registeredAddressLine1: '',
				registeredAddressLine2: '',
				registeredCity: '',
				registeredState: '',
				registeredPostalCode: '',
				registeredCountry: '',
				website: '',
				registrationNumber: '',
				yearEstablished: '',
				facebook: '',
				instagram: '',
				twitter: '',
				linkedin: '',
				youtube: '',
				tedxLicenseId: '',
				tedxLicenseOwnerName: '',
				tedxLicenseOwnerEmail: '',
				tedxLicenseScope: '',
				tedxLicenseExpiryDate: '',
				tedxDocumentLinks: '',
				healthOrganizerType: '',
				healthDirectorName: '',
				healthRegistrationNumber: '',
				healthPartnerHospitalName: '',
				healthEmergencyContact: '',
				healthDocumentLinks: '',
				concertOrganizerType: '',
				concertPrimaryArtists: '',
				concertVenueNameConfirm: '',
				concertVenueCapacityConfirm: '',
				concertAgeRestrictions: '',
				concertDocumentLinks: '',
				exhibitionVenueDetails: '',
				exhibitionHallDetails: '',
				exhibitionKeyExhibitors: '',
				exhibitionDocumentLinks: '',
			});
			setImagePreview(null);
			setImageBase64(null);
			setImageFile(null);
		} catch (err) {
			setMessage({ type: 'error', text: err.message || 'Failed to create event' });
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<div className="create-event-page">
			<h2>Create an event</h2>

			{message && (
				<div className={message.type === 'error' ? 'message message--error' : 'message message--success'}>
					{message.text}
				</div>
			)}

			<form className="ce-form" onSubmit={handleSubmit} noValidate>
				<div className="form-group">
					<label className="form-label" htmlFor="title">Title *</label>
					<input className="form-control" id="title" name="title" value={form.title} onChange={handleChange} required />
					{errors.title && <div className="error">{errors.title}</div>}
				</div>

				<div className="form-group">
					<label className="form-label" htmlFor="description">Description</label>
					<textarea className="form-control textarea" id="description" name="description" value={form.description} onChange={handleChange} rows={5} />
				</div>

				<div className="ce-row">
					<div className="ce-col">
						<div className="form-group">
							<label className="form-label" htmlFor="startDateTime">Start (date & time) *</label>
							<input className="form-control" id="startDateTime" name="startDateTime" type="datetime-local" value={form.startDateTime} onChange={handleChange} required />
							{errors.startDateTime && <div className="error">{errors.startDateTime}</div>}
						</div>
					</div>

					<div className="ce-col">
						<div className="form-group">
							<label className="form-label" htmlFor="endDateTime">End (date & time) *</label>
							  <input className="form-control" id="endDateTime" name="endDateTime" type="datetime-local" value={form.endDateTime} onChange={handleChange} required min={form.startDateTime || undefined} />
							{errors.endDateTime && <div className="error">{errors.endDateTime}</div>}
						</div>
					</div>
				</div>

				<div className="ce-row">
					<div className="ce-col">
						<div className="form-group">
							<label className="form-label" htmlFor="venue">Venue</label>
							<input className="form-control" id="venue" name="venue" value={form.venue} onChange={handleChange} />
						</div>
					</div>

					<div className="ce-col--narrow">
						<div className="form-group">
							<label className="form-label" htmlFor="capacity">Capacity</label>
							<input className="form-control" id="capacity" name="capacity" type="number" value={form.capacity} onChange={handleChange} />
							{errors.capacity && <div className="error">{errors.capacity}</div>}
						</div>
					</div>
				</div>

				<div className="field-grid">
					<div className="form-group">
						<label className="form-label" htmlFor="category">Category</label>
						<select className="form-control" id="category" name="category" value={form.category} onChange={handleChange}>
							<option value="">Select category</option>
							{CATEGORY_OPTIONS.map((c) => (
								<option key={c} value={c}>{c}</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label className="form-label" htmlFor="status">Status</label>
						<select className="form-control" id="status" name="status" value={form.status} onChange={handleChange}>
							<option value="">Select status</option>
							{STATUS_OPTIONS.map((s) => (
								<option key={s} value={s}>{s.replace('_', ' ')}</option>
							))}
						</select>
					</div>

					<div className="form-group">
						<label className="form-label" htmlFor="price">Price (₹)</label>
						<input className="form-control" id="price" name="price" type="number" value={form.price} onChange={handleChange} />
						{errors.price && <div className="error">{errors.price}</div>}
					</div>
				</div>

				<div className="form-group">
					<label className="form-label" htmlFor="image">Event image (optional)</label>
					  <input className="form-control" id="image" name="image" type="file" accept="image/png, image/jpeg" onChange={handleFile} />
					  {errors.image && <div className="error">{errors.image}</div>}
					{imagePreview && (
						<div className="image-preview">
							<img src={imagePreview} alt="preview" />
						</div>
					)}
				</div>

				<hr />

				<h3>Organizer details (for verification)</h3>

				<div className="field-grid">
					<div className="form-group">
						<label className="form-label" htmlFor="orgType">Organizer type</label>
						<select className="form-control" id="orgType" name="orgType" value={form.orgType} onChange={handleChange}>
							<option value="">Select organizer type</option>
							<option value="Individual">Individual</option>
							<option value="Company">Company</option>
							<option value="NGO">NGO</option>
							<option value="College/University">College / University</option>
							<option value="Government">Government</option>
							<option value="Hospital">Hospital</option>
							<option value="Clinic">Clinic</option>
							<option value="Event Company">Event Company</option>
							<option value="Artist Management">Artist Management</option>
						</select>
					</div>
					<div className="form-group">
						<label className="form-label" htmlFor="website">Organization website</label>
						<input className="form-control" id="website" name="website" value={form.website} onChange={handleChange} />
					</div>
				</div>

				<div className="field-grid">
					<div className="form-group">
						<label className="form-label" htmlFor="registrationNumber">Registration / license number</label>
						<input className="form-control" id="registrationNumber" name="registrationNumber" value={form.registrationNumber} onChange={handleChange} />
					</div>
					<div className="form-group">
						<label className="form-label" htmlFor="yearEstablished">Year established</label>
						<input className="form-control" id="yearEstablished" name="yearEstablished" type="number" value={form.yearEstablished} onChange={handleChange} />
					</div>
				</div>

				<div className="form-group">
					<label className="form-label">Registered address</label>
					<input className="form-control" placeholder="Address line 1" name="registeredAddressLine1" value={form.registeredAddressLine1} onChange={handleChange} />
					<input className="form-control" placeholder="Address line 2" name="registeredAddressLine2" value={form.registeredAddressLine2} onChange={handleChange} style={{ marginTop: 8 }} />
					<div className="ce-row" style={{ marginTop: 8 }}>
						<div className="ce-col">
							<input className="form-control" placeholder="City" name="registeredCity" value={form.registeredCity} onChange={handleChange} />
						</div>
						<div className="ce-col">
							<input className="form-control" placeholder="State" name="registeredState" value={form.registeredState} onChange={handleChange} />
						</div>
					</div>
					<div className="ce-row" style={{ marginTop: 8 }}>
						<div className="ce-col">
							<input className="form-control" placeholder="Postal code" name="registeredPostalCode" value={form.registeredPostalCode} onChange={handleChange} />
						</div>
						<div className="ce-col">
							<input className="form-control" placeholder="Country" name="registeredCountry" value={form.registeredCountry} onChange={handleChange} />
						</div>
					</div>
				</div>

				<div className="field-grid">
					<div className="form-group">
						<label className="form-label" htmlFor="facebook">Facebook page (optional)</label>
						<input className="form-control" id="facebook" name="facebook" value={form.facebook} onChange={handleChange} />
					</div>
					<div className="form-group">
						<label className="form-label" htmlFor="instagram">Instagram (optional)</label>
						<input className="form-control" id="instagram" name="instagram" value={form.instagram} onChange={handleChange} />
					</div>
				</div>

				<div className="field-grid">
					<div className="form-group">
						<label className="form-label" htmlFor="twitter">Twitter / X (optional)</label>
						<input className="form-control" id="twitter" name="twitter" value={form.twitter} onChange={handleChange} />
					</div>
					<div className="form-group">
						<label className="form-label" htmlFor="linkedin">LinkedIn (optional)</label>
						<input className="form-control" id="linkedin" name="linkedin" value={form.linkedin} onChange={handleChange} />
					</div>
				</div>

				<div className="form-group">
					<label className="form-label" htmlFor="youtube">YouTube channel (optional)</label>
					<input className="form-control" id="youtube" name="youtube" value={form.youtube} onChange={handleChange} />
				</div>

				{/* Category-specific extra fields */}
				{form.category === 'TEDx' && (
					<>
						<hr />
						<h3>TEDx details</h3>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="tedxLicenseId">TEDx license ID</label>
								<input className="form-control" id="tedxLicenseId" name="tedxLicenseId" value={form.tedxLicenseId} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="tedxLicenseOwnerName">License owner name</label>
								<input className="form-control" id="tedxLicenseOwnerName" name="tedxLicenseOwnerName" value={form.tedxLicenseOwnerName} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="tedxLicenseOwnerEmail">License owner email</label>
								<input className="form-control" id="tedxLicenseOwnerEmail" name="tedxLicenseOwnerEmail" type="email" value={form.tedxLicenseOwnerEmail} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="tedxLicenseScope">Geographic scope (city / region)</label>
								<input className="form-control" id="tedxLicenseScope" name="tedxLicenseScope" value={form.tedxLicenseScope} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="tedxLicenseExpiryDate">License expiry date</label>
								<input className="form-control" id="tedxLicenseExpiryDate" name="tedxLicenseExpiryDate" type="date" value={form.tedxLicenseExpiryDate} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="tedxDocumentLinks">License document links (optional)</label>
								<textarea className="form-control textarea" id="tedxDocumentLinks" name="tedxDocumentLinks" value={form.tedxDocumentLinks} onChange={handleChange} rows={3} placeholder="Links to TEDx license / approval letters" />
							</div>
						</div>
					</>
				)}

				{form.category === 'Health Camp' && (
					<>
						<hr />
						<h3>Health Camp details</h3>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="healthOrganizerType">Organizer type</label>
								<select className="form-control" id="healthOrganizerType" name="healthOrganizerType" value={form.healthOrganizerType} onChange={handleChange}>
									<option value="">Select type</option>
									<option value="Hospital">Hospital</option>
									<option value="Clinic">Clinic</option>
									<option value="NGO">NGO</option>
									<option value="Individual Doctor Group">Individual Doctor Group</option>
								</select>
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="healthDirectorName">Medical director / responsible doctor name</label>
								<input className="form-control" id="healthDirectorName" name="healthDirectorName" value={form.healthDirectorName} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="healthRegistrationNumber">Medical registration number</label>
								<input className="form-control" id="healthRegistrationNumber" name="healthRegistrationNumber" value={form.healthRegistrationNumber} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="healthPartnerHospitalName">Partner hospital / clinic name</label>
								<input className="form-control" id="healthPartnerHospitalName" name="healthPartnerHospitalName" value={form.healthPartnerHospitalName} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="healthEmergencyContact">Emergency contact</label>
								<input className="form-control" id="healthEmergencyContact" name="healthEmergencyContact" value={form.healthEmergencyContact} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="healthDocumentLinks">Medical registration / permission document links (optional)</label>
								<textarea className="form-control textarea" id="healthDocumentLinks" name="healthDocumentLinks" value={form.healthDocumentLinks} onChange={handleChange} rows={3} placeholder="Links to registration certificates, hospital proof, permissions" />
							</div>
						</div>
					</>
				)}

				{form.category === 'Concerts' && (
					<>
						<hr />
						<h3>Concert details</h3>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="concertOrganizerType">Organizer type</label>
								<select className="form-control" id="concertOrganizerType" name="concertOrganizerType" value={form.concertOrganizerType} onChange={handleChange}>
									<option value="">Select type</option>
									<option value="Event Company">Event Company</option>
									<option value="Artist Management">Artist Management</option>
									<option value="Individual">Individual</option>
								</select>
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="concertPrimaryArtists">Primary artist / band names</label>
								<input className="form-control" id="concertPrimaryArtists" name="concertPrimaryArtists" value={form.concertPrimaryArtists} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="concertVenueNameConfirm">Venue name (as per booking)</label>
								<input className="form-control" id="concertVenueNameConfirm" name="concertVenueNameConfirm" value={form.concertVenueNameConfirm} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="concertVenueCapacityConfirm">Venue capacity confirmation</label>
								<input className="form-control" id="concertVenueCapacityConfirm" name="concertVenueCapacityConfirm" value={form.concertVenueCapacityConfirm} onChange={handleChange} />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="concertAgeRestrictions">Age restrictions (if any)</label>
								<input className="form-control" id="concertAgeRestrictions" name="concertAgeRestrictions" value={form.concertAgeRestrictions} onChange={handleChange} />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="concertDocumentLinks">Venue / permit document links (optional)</label>
								<textarea className="form-control textarea" id="concertDocumentLinks" name="concertDocumentLinks" value={form.concertDocumentLinks} onChange={handleChange} rows={3} placeholder="Links to venue contract, NOCs, permits" />
							</div>
						</div>
					</>
				)}

				{form.category === 'Exhibitions' && (
					<>
						<hr />
						<h3>Exhibition details</h3>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="exhibitionVenueDetails">Venue details</label>
								<textarea className="form-control textarea" id="exhibitionVenueDetails" name="exhibitionVenueDetails" value={form.exhibitionVenueDetails} onChange={handleChange} rows={3} placeholder="Venue name, address, complex, etc." />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="exhibitionHallDetails">Hall details</label>
								<textarea className="form-control textarea" id="exhibitionHallDetails" name="exhibitionHallDetails" value={form.exhibitionHallDetails} onChange={handleChange} rows={3} placeholder="Hall numbers / sections, floor, etc." />
							</div>
						</div>
						<div className="field-grid">
							<div className="form-group">
								<label className="form-label" htmlFor="exhibitionKeyExhibitors">Key exhibitors / partners</label>
								<textarea className="form-control textarea" id="exhibitionKeyExhibitors" name="exhibitionKeyExhibitors" value={form.exhibitionKeyExhibitors} onChange={handleChange} rows={3} placeholder="Main exhibitors, partners, brands" />
							</div>
							<div className="form-group">
								<label className="form-label" htmlFor="exhibitionDocumentLinks">Venue / trade license document links (optional)</label>
								<textarea className="form-control textarea" id="exhibitionDocumentLinks" name="exhibitionDocumentLinks" value={form.exhibitionDocumentLinks} onChange={handleChange} rows={3} placeholder="Links to venue agreement, trade license, etc." />
							</div>
						</div>
					</>
				)}

				<div className="ce-actions">
					<button type="submit" disabled={submitting} className="btn btn-primary">
						{submitting ? 'Creating…' : 'Create Event'}
					</button>
					<button type="button" className="btn btn-ghost" onClick={() => { setForm({ title: '', description: '', venue: '', category: '', status: '', price: '', capacity: '', startDateTime: '', endDateTime: '' }); setImagePreview(null); setImageBase64(null); setErrors({}); setMessage(null); }}>
						Reset
					</button>
				</div>
			</form>
		</div>
	);
}

