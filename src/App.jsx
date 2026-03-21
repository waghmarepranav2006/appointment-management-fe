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

  // 1. Fetch doctors on load
  useEffect(() => {
    axios.get('http://localhost:5000/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Error fetching doctors:", err));
  }, []);

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/appointments', formData);
      setMessage(response.data.message);
      // Reset form
      setFormData({ doctor_id: '', patient_name: '', appointment_date: '', appointment_time: '' });
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.error || "Booking failed"));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Book an Appointment</h2>
      
      {message && <p style={{ padding: '10px', backgroundColor: '#e1f5fe', color: '#01579b', borderRadius: '5px', textAlign: 'center' }}>{message}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label><User size={16} /> Patient Name</label>
          <input 
            type="text" 
            required
            value={formData.patient_name}
            onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
            placeholder="Enter your full name"
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label><Stethoscope size={16} /> Select Doctor</label>
          <select 
            required
            value={formData.doctor_id}
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
              type="date" 
              required
              value={formData.appointment_date}
              onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <label><Clock size={16} /> Time</label>
            <input 
              type="time" 
              required
              value={formData.appointment_time}
              onChange={(e) => setFormData({...formData, appointment_time: e.target.value})}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <button type="submit" style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', marginTop: '10px' }}>
          Confirm Appointment
        </button>
      </form>
    </div>
  );
}

export default App;