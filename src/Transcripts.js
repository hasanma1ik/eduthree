import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import axios from 'axios';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

const Transcript = ({ route, navigation }) => {
  // Destructure parameters from route
  const { studentId, studentName, grade, term, teacherName } = route.params;

  const [marksData, setMarksData] = useState([]);
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Letter grade helper
  const getLetterGrade = (pct) => {
    const p = parseFloat(pct);
    if (p >= 93) return 'A+';
    else if (p >= 86) return 'A';
    else if (p >= 80) return 'B+';
    else if (p >= 73) return 'B';
    else if (p >= 65) return 'C+';
    else if (p >= 58) return 'C';
    else if (p >= 50) return 'D+';
    else if (p >= 40) return 'D';
    else return 'F';
  };

  // Fetch transcript data on mount
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/auth/transcripts', {
          params: { studentId, term, grade }
        });
        setMarksData(response.data.marksReports || []);
        setGrowthData(response.data.growthReports || []);
      } catch (err) {
        setError('Failed to fetch transcript data');
      } finally {
        setLoading(false);
      }
    };
    fetchTranscript();
  }, [studentId, term, grade]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
         <ActivityIndicator size="large" color="#018749" />
      </View>
    );
  }

  // Check if we have any final-term marks
  const hasFinalTermMarks = marksData.some(m => m.finalTermMarks && m.finalTermMarks > 0);

  // Totals & percentages
  const subjectsCount = marksData.length;
  const totalMidTerm = marksData.reduce((sum, m) => sum + (m.midTermMarks || 0), 0);
  const totalFinalTerm = marksData.reduce((sum, m) => (m.finalTermMarks && m.finalTermMarks > 0 ? sum + m.finalTermMarks : sum), 0);
  const totalPossibleMid = subjectsCount * 100;
  const finalSubjectsCount = marksData.filter(m => m.finalTermMarks && m.finalTermMarks > 0).length;
  const totalPossibleFinal = finalSubjectsCount * 100;
  const midTermPercentage = subjectsCount ? ((totalMidTerm / totalPossibleMid) * 100).toFixed(2) : '0.00';
  const finalTermPercentage = finalSubjectsCount > 0 ? ((totalFinalTerm / totalPossibleFinal) * 100).toFixed(2) : '0.00';

  // Letter grades
  const midTermGrade = getLetterGrade(midTermPercentage);
  const finalTermGrade = finalSubjectsCount > 0 ? getLetterGrade(finalTermPercentage) : '';

  // Teacher comments
  const teacherCommentsList = marksData.filter(mark => mark.comment && mark.comment.trim() !== '');

  /**
   * Download PDF using Expo Print & Sharing.
   */
  const downloadPDF = async () => {
    try {
      // Load local logo asset and convert it to a base64 data URL
      const logoAsset = Asset.fromModule(require('../assets/lalogo.jpg'));
      await logoAsset.downloadAsync();
      const logoUri = logoAsset.localUri;
      const base64Logo = await FileSystem.readAsStringAsync(logoUri, { encoding: FileSystem.EncodingType.Base64 });
      const logoDataUrl = `data:image/jpeg;base64,${base64Logo}`;

      const htmlContent = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { text-align: center; font-size: 20px; font-weight: bold; margin: 0; }
              h2 { text-align: center; margin-bottom: 10px; }
              p { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #000; padding: 5px; text-align: center; }
              th { background-color: #f0f0f0; }
              .left { text-align: left; }
              .smallText { font-size: 12px; }
              .bigText { font-size: 22px; }
            </style>
          </head>
          <body>
            <h1></h1>
            <div style="text-align:center; margin-top:10px;">
              <img src="${logoDataUrl}" style="max-width:150px;" />
              <p class="smallText">0318-1142457 - 0311-1126725<br>info.learnschool@gmail.com</p>
              <h2 class="bigText">Progress Report</h2>
            </div>
            <hr/>
            <p><strong>Student:</strong> ${studentName}</p>
            <p><strong>Grade:</strong> ${grade} &nbsp;&nbsp;&nbsp; <strong>Term:</strong> ${term}</p>
            <hr/>
            <h2>Marksheet</h2>
            <table>
              <tr>
                <th class="left">Subject</th>
                <th>Mid Term</th>
                ${hasFinalTermMarks ? '<th>Final Term</th>' : ''}
              </tr>
              ${marksData.map(mark => `
                <tr>
                  <td class="left">${mark.subject?.name || 'Subject'}</td>
                  <td>${mark.midTermMarks !== 0 ? mark.midTermMarks : '-'}</td>
                  ${hasFinalTermMarks ? `<td>${mark.finalTermMarks && mark.finalTermMarks !== 0 ? mark.finalTermMarks : '-'}</td>` : ''}
                </tr>
              `).join('')}
              <tr>
                <td class="left"><strong>Obtained Marks</strong></td>
                <td><strong>${totalMidTerm}/${totalPossibleMid}</strong></td>
                ${hasFinalTermMarks ? `<td><strong>${totalFinalTerm}/${totalPossibleFinal}</strong></td>` : ''}
              </tr>
            </table>
            <h2>Term Summary</h2>
            <table>
              <tr>
                <th>TERM</th>
                <th>PERCENTAGE</th>
                <th>GRADE</th>
              </tr>
              <tr>
                <td>Mid Term</td>
                <td>${midTermPercentage}%</td>
                <td>${midTermGrade}</td>
              </tr>
              ${finalSubjectsCount > 0 ? `
              <tr>
                <td>Final Term</td>
                <td>${finalTermPercentage}%</td>
                <td>${finalTermGrade}</td>
              </tr>
              ` : ''}
            </table>
            <h2>TEACHER'S COMMENT</h2>
            ${teacherCommentsList.length > 0 
              ? teacherCommentsList.map(mark => `<p class="left"><strong>${mark.subject?.name}:</strong> ${mark.comment}</p>`).join('') 
              : '<p>No comments.</p>'}
            <h2>Personal and Social Development</h2>
            <table>
              <tr>
                <th class="left">Objective</th>
                <th>Mid Term</th>
                ${hasFinalTermMarks ? '<th>Final Term</th>' : ''}
              </tr>
              ${growthData.map(growth => {
                if (growth.personalDevelopment && growth.personalDevelopment.length > 0) {
                  return growth.personalDevelopment.map(pd => `
                    <tr>
                      <td class="left">${pd.objective}</td>
                      <td>${pd.midTermRating || '-'}</td>
                      ${hasFinalTermMarks ? `<td>${pd.finalTermRating || '-'}</td>` : ''}
                    </tr>
                  `).join('');
                } else {
                  return '';
                }
              }).join('')}
            </table>
            <div style="margin-top: 60px; display: flex; justify-content: space-between;">
              <div style="text-align: left;">
                <p>______________________________</p>
                <p>Class Teacher's Signature</p>
              </div>
              <div style="text-align: right;">
                <p>______________________________</p>
                <p>Principal's Signature</p>
              </div>
            </div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (err) {
      Alert.alert('Error', 'Failed to generate PDF: ' + err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/lalogo.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Student/Grade/Term Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Student: {studentName}</Text>
        <Text style={styles.infoText}>
          Grade: {grade}                            Term: {term}
        </Text>
      </View>

      {/* Marksheet Table */}
      <View style={styles.section}>
        {marksData && marksData.length > 0 ? (
          <>
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.subjectColumn, styles.leftAlign]}>
                SUBJECT
              </Text>
              <Text style={[styles.headerCell, styles.markColumn]}>MID TERM</Text>
              {hasFinalTermMarks && (
                <Text style={[styles.headerCell, styles.markColumn]}>FINAL TERM</Text>
              )}
            </View>
            {marksData.map((mark, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.rowCell, styles.subjectColumn, styles.leftAlign]}>
                  {mark.subject?.name || 'Subject'}
                </Text>
                <Text style={[styles.rowCell, styles.markColumn]}>
                  {mark.midTermMarks !== 0 ? mark.midTermMarks : '-'}
                </Text>
                {hasFinalTermMarks && (
                  <Text style={[styles.rowCell, styles.markColumn]}>
                    {mark.finalTermMarks && mark.finalTermMarks !== 0 ? mark.finalTermMarks : '-'}
                  </Text>
                )}
              </View>
            ))}
            {/* Obtained Marks Row */}
            <View style={styles.tableRow}>
              <Text style={[styles.rowCell, styles.subjectColumn, styles.leftAlign]}>
                Obtained Marks
              </Text>
              <Text style={[styles.rowCell, styles.markColumn]}>
                {totalMidTerm}/{(marksData.length * 100)}
              </Text>
              {hasFinalTermMarks && (
                <Text style={[styles.rowCell, styles.markColumn]}>
                  {totalFinalTerm}/{(marksData.filter(m => m.finalTermMarks && m.finalTermMarks > 0).length * 100)}
                </Text>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.notSubmitted}>Marksheet not yet submitted.</Text>
        )}
      </View>

      {/* Term Summary Table */}
      {marksData.length > 0 && (
        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.termColumn]}>TERM</Text>
            <Text style={[styles.headerCell, styles.termColumn]}>PERCENTAGE</Text>
            <Text style={[styles.headerCell, styles.termColumn]}>GRADE</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.rowCell, styles.termColumn]}>Mid Term</Text>
            <Text style={[styles.rowCell, styles.termColumn]}>{midTermPercentage}%</Text>
            <Text style={[styles.rowCell, styles.termColumn]}>{midTermGrade}</Text>
          </View>
          {hasFinalTermMarks && (
            <View style={styles.tableRow}>
              <Text style={[styles.rowCell, styles.termColumn]}>Final Term</Text>
              <Text style={[styles.rowCell, styles.termColumn]}>{finalTermPercentage}%</Text>
              <Text style={[styles.rowCell, styles.termColumn]}>{finalTermGrade}</Text>
            </View>
          )}
        </View>
      )}

      {/* Teacher's Comments Section */}
      <View style={styles.section}>
        <Text style={styles.commentHeader}>TEACHER'S COMMENTS</Text>
        {teacherCommentsList.length > 0 ? (
          teacherCommentsList.map((mark, idx) => (
            <Text key={idx} style={styles.commentText}>
              {mark.subject?.name}: {mark.comment}
            </Text>
          ))
        ) : (
          <Text style={styles.notSubmitted}>No comments.</Text>
        )}
      </View>

      {/* Personal and Social Development Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal and Social Development</Text>
        {growthData && growthData.length > 0 ? (
          growthData.map((growth, index) => (
            <View key={index} style={styles.growthContainer}>
              {growth.personalDevelopment && growth.personalDevelopment.length > 0 ? (
                <>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.headerCell, styles.objectiveColumn, styles.leftAlign]}>
                      OBJECTIVE
                    </Text>
                    <Text style={[styles.headerCell, styles.markColumn]}>MID TERM</Text>
                    {hasFinalTermMarks && (
                      <Text style={[styles.headerCell, styles.markColumn]}>FINAL TERM</Text>
                    )}
                  </View>
                  {growth.personalDevelopment.map((pd, idx) => (
                    <View key={idx} style={styles.tableRow}>
                      <Text style={[styles.rowCell, styles.objectiveColumn, styles.leftAlign]}>
                        {pd.objective}
                      </Text>
                      <Text style={[styles.rowCell, styles.markColumn]}>
                        {pd.midTermRating || '-'}
                      </Text>
                      {hasFinalTermMarks && (
                        <Text style={[styles.rowCell, styles.markColumn]}>
                          {pd.finalTermRating || '-'}
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles.notSubmitted}>
                  Growth report not submitted for this subject.
                </Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.notSubmitted}>Growth report not yet submitted.</Text>
        )}
      </View>

      {/* Download PDF Button */}
      <TouchableOpacity style={styles.downloadButton} onPress={downloadPDF}>
        <Text style={styles.downloadButtonText}>Download PDF</Text>
      </TouchableOpacity>

      {marksData.length === 0 && growthData.length === 0 && (
        <Text style={styles.notSubmitted}>
          Student Progress Report not yet submitted.
        </Text>
      )}

      {error !== '' && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  logo: {
    width: 150,
    height: 80,
    alignSelf: 'center',
    marginBottom: 20
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoContainer: {
    marginBottom: 20
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Kanit-Medium',
    color: '#333',
    marginVertical: 2
  },
  section: {
    marginBottom: 20
  },
  sectionHeader: {
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
    color: '#006A4E',
    textAlign: 'center',
    marginBottom: 10
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 5,
    marginBottom: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    paddingVertical: 8
  },
  headerCell: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#333',
    textAlign: 'center'
  },
  rowCell: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#333',
    textAlign: 'center'
  },
  leftAlign: {
    textAlign: 'left'
  },
  subjectColumn: {
    flex: 2
  },
  markColumn: {
    flex: 1
  },
  objectiveColumn: {
    flex: 2
  },
  termColumn: {
    flex: 1
  },
  notSubmitted: {
    fontSize: 14,
    fontFamily: 'Kanit-Medium',
    color: '#999',
    textAlign: 'center',
    marginVertical: 10
  },
  growthContainer: {
    marginBottom: 15
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center'
  },
  commentHeader: {
    fontSize: 18,
    fontFamily: 'Kanit-Medium',
    color: '#006A4E',
    textAlign: 'center',
    marginBottom: 5
  },
  commentText: {
    fontSize: 12,
    fontFamily: 'Kanit-Medium',
    color: '#333',
    marginHorizontal: 10,
    textAlign: 'left'
  },
  downloadButton: {
    backgroundColor: '#018749',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Kanit-Medium'
  }
});

export default Transcript;
