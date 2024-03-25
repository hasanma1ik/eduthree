



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


 useEffect(()=>{
            const loadLocalStorageData = async () =>{
                    let data = await AsyncStorage.getItem('@auth')
                    let loginData = JSON.parse(data)
                    setState({...state, user:loginData?.user, token : loginData?.token})  //loginData - it will redirect us to homepage
            }
            loadLocalStorageData()
        }, [])
