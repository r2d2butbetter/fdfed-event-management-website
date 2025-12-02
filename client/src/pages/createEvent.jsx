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
			setForm({ title: '', description: '', venue: '', category: '', status: '', price: '', capacity: '', startDateTime: '', endDateTime: '' });
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

