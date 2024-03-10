



 const response = await axios.get(`/auth/attendance/${selectedGrade}/${selectedSubject}/${selectedDate}`);

const getAttendanceData = async (req, res) => {
  try {
    const { grade, subject, date } = req.params;
    const attendance = await AttendanceRecord.find({ grade, subject, date });
    res.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};