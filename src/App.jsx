import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Stethoscope, Clock } from 'lucide-react';

function App() {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_name: '',
    appointment_date: '',
    appointment_time: ''
  });
  const [message, setMessage] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  // 1. Fetch doctors and appointments on load
  useEffect(() => {
    axios.get('http://localhost:5000/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Error fetching doctors:", err));
    
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    axios.get('http://localhost:5000/appointments')
      .then(res => setAppointments(res.data))
      .catch(err => console.error("Error fetching appointments:", err));
  };

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAppointmentId) {
        const response = await axios.put(`http://localhost:5000/appointments/${editingAppointmentId}`, formData);
        setMessage(response.data.message);
      } else {
        const response = await axios.post('http://localhost:5000/appointments', formData);
        setMessage(response.data.message);
      }
      
      // Reset form
      setFormData({ doctor_id: '', patient_name: '', appointment_date: '', appointment_time: '' });
      setEditingAppointmentId(null);
      
      // Refresh the table!
      fetchAppointments(); 
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Request failed'));
    }
    // REMOVED: The duplicate axios.post call that was here
  };

  const handleEditClick = (appointment) => {
    setEditingAppointmentId(appointment.id);
    setFormData({
      doctor_id: String(appointment.doctor_id),
      patient_name: appointment.patient_name,
      appointment_date: new Date(appointment.appointment_date).toISOString().split('T')[0],
      appointment_time: String(appointment.appointment_time).slice(0, 5)
    });
    setMessage('');
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setFormData({ doctor_id: '', patient_name: '', appointment_date: '', appointment_time: '' });
    setMessage('');
  };

  const handleDelete = async (appointmentId) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this appointment?');
    if (!isConfirmed) return;

    try {
      const response = await axios.delete(`http://localhost:5000/appointments/${appointmentId}`);
      setMessage(response.data.message);
      if (editingAppointmentId === appointmentId) {
        handleCancelEdit();
      }
      fetchAppointments();
    } catch (err) {
      setMessage('Error: ' + (err.response?.data?.error || 'Delete failed'));
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* SECTION: Booking Form */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '40px' }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>
          {editingAppointmentId ? 'Edit Appointment' : 'Book an Appointment'}
        </h2>
        
        {message && <p style={{ padding: '10px', backgroundColor: '#e1f5fe', color: '#01579b', borderRadius: '5px', textAlign: 'center' }}>{message}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label><User size={16} /> Patient Name</label>
            <input 
              type="text" required value={formData.patient_name}
              onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
              placeholder="Enter your full name"
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label><Stethoscope size={16} /> Select Doctor</label>
            <select 
              required value={formData.doctor_id}
              onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="">-- Choose a Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} ({doc.specialization})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label><Calendar size={16} /> Date</label>
              <input 
                type="date" required value={formData.appointment_date}
                onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label><Clock size={16} /> Time</label>
              <input 
                type="time" required value={formData.appointment_time}
                onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
              {editingAppointmentId ? 'Update Appointment' : 'Confirm Appointment'}
            </button>
            {editingAppointmentId && (
              <button type="button" onClick={handleCancelEdit} style={{ padding: '12px 16px', background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SECTION: Appointments Table */}
      <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}>
        <h3 style={{ textAlign: 'center' }}>Scheduled Appointments</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Patient</th>
              <th style={{ padding: '12px' }}>Doctor</th>
              <th style={{ padding: '12px' }}>Date</th>
              <th style={{ padding: '12px' }}>Time</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? (
              appointments.map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{app.patient_name}</td>
                  <td style={{ padding: '12px' }}>{app.doctor_name}</td>
                  <td style={{ padding: '12px' }}>{new Date(app.appointment_date).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '12px' }}>{String(app.appointment_time).slice(0, 5)}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => handleEditClick(app)} style={{ padding: '6px 10px', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(app.id)} style={{ padding: '6px 10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No appointments scheduled yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;