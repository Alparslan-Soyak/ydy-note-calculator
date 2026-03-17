import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, StyleSheet, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.lang = 'tr';
      const meta = document.createElement('meta');
      meta.name = 'google';
      meta.content = 'notranslate';
      document.head.appendChild(meta);
    }
  }, []);

  const [selectedCourse, setSelectedCourse] = useState('A');
  const [grades, setGrades] = useState({
    quiz: ['', '', '', ''],
    vize: ['', '', '', ''],
    writing: '',
    sunum: '',
    kanaat: '',
    odev: '',
    final: '',
    butunleme: '',
  });

  const [results, setResults] = useState(null);
  const [targetNote, setTargetNote] = useState(null);

  const calculateGrade = () => {
    const quizValues = grades.quiz.map(v => parseFloat(v) || 0);
    const vizeValues = grades.vize.map(v => parseFloat(v) || 0);
    
    const quizPoints = (quizValues.reduce((a, b) => a + b, 0) / 4 / 100) * 20;
    const vizePoints = (vizeValues.reduce((a, b) => a + b, 0) / 4 / 100) * 60;

    const writingPoints = (parseFloat(grades.writing) || 0) / 100 * 5;
    const sunumPoints = (parseFloat(grades.sunum) || 0) / 100 * 5;
    const kanaatPoints = (parseFloat(grades.kanaat) || 0) / 100 * 5;
    const odevPoints = (parseFloat(grades.odev) || 0) / 100 * 5;

    const ortalama = quizPoints + vizePoints + writingPoints + sunumPoints + kanaatPoints + odevPoints;
    const minForPass = selectedCourse === 'A' ? 85 : selectedCourse === 'B' ? 80 : 75;

    // Hedef Final Notu Hesaplama (Final kutusu boşsa çalışır)
    if (!grades.final) {
      if (ortalama >= minForPass) {
        setTargetNote({ type: 'pass', text: 'Ortalamanız zaten geçmek için yeterli!' });
      } else {
        // Formül: (Hedef(65) - Ortalama * 0.4) / 0.6
        const needed = Math.ceil((65 - (ortalama * 0.4)) / 0.6);
        if (needed <= 100) {
          setTargetNote({ type: 'target', text: `Geçmek için Finalden en az ${needed} almalısınız.` });
        } else {
          setTargetNote({ type: 'fail', text: 'Maalesef Finalden 100 alsanız bile geçemiyorsunuz.' });
        }
      }
    } else {
      setTargetNote(null);
    }

    let finalResult = {};

    if (ortalama >= minForPass) {
      finalResult = {
        ortalama: ortalama.toFixed(2),
        durum: 'Ortalama ile Geçtiniz ✓',
        renkClass: 'success',
        detay: `Ortalamanız ${ortalama.toFixed(2)} puan ile barajın üzerindedir.`,
      };
    } else if (!grades.final) {
      finalResult = {
        ortalama: ortalama.toFixed(2),
        durum: 'Finale Kaldınız',
        renkClass: 'danger',
        detay: `Ortalamanız ${ortalama.toFixed(2)} puandır. Final notunu girin.`,
      };
    } else {
      const finalScore = (parseFloat(grades.final) * 0.6 + ortalama * 0.4).toFixed(2);

      if (finalScore >= 65) {
        finalResult = {
          ortalama: ortalama.toFixed(2),
          finalNotu: grades.final,
          finalHesap: finalScore,
          durum: 'Final ile Geçtiniz ✓',
          renkClass: 'success',
          detay: `Final (%60) + Ortalama (%40) = ${finalScore} puan`,
        };
      } else if (!grades.butunleme) {
        finalResult = {
          ortalama: ortalama.toFixed(2),
          finalNotu: grades.final,
          finalHesap: finalScore,
          durum: 'Bütünlemeye Kaldınız',
          renkClass: 'danger',
          detay: `Final sonucunuz ${finalScore} puandır.`,
        };
      } else {
        const butScore = (parseFloat(grades.butunleme) * 0.6 + ortalama * 0.4).toFixed(2);
        const isPass = butScore >= 65;
        finalResult = {
          ortalama: ortalama.toFixed(2),
          finalNotu: grades.final,
          finalHesap: finalScore,
          butunlemeNotu: grades.butunleme,
          butunlemeHesap: butScore,
          durum: isPass ? 'Bütünleme ile Geçtiniz ✓' : 'Dersten Kaldınız ✗',
          renkClass: isPass ? 'success' : 'fail',
          detay: `Bütünleme (%60) + Ortalama (%40) = ${butScore} puan`,
        };
      }
    }
    setResults(finalResult);
  };

  const handleInputChange = (field, index, value) => {
    const numValue = value === '' ? '' : Math.min(Math.max(parseFloat(value) || 0, 0), 100).toString();
    if (Array.isArray(grades[field])) {
      const newArr = [...grades[field]];
      newArr[index] = numValue;
      setGrades({ ...grades, [field]: newArr });
    } else {
      setGrades({ ...grades, [field]: numValue });
    }
  };

  const handleReset = () => {
    setGrades({ quiz: ['', '', '', ''], vize: ['', '', '', ''], writing: '', sunum: '', kanaat: '', odev: '', final: '', butunleme: '' });
    setResults(null);
    setTargetNote(null);
  };

  const getResultColor = (res) => {
    if (!res) return '#6b7280';
    if (res.renkClass === 'success') return '#10b981';
    return '#ef4444';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>YDY</Text>
          <Text style={styles.subtitle}>Not Hesaplama</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kur Seçimi</Text>
          <View style={styles.courseButtons}>
            {['A', 'B', 'C'].map((kur) => (
              <TouchableOpacity key={kur} onPress={() => setSelectedCourse(kur)} style={[styles.courseButton, selectedCourse === kur && styles.courseButtonActive]}>
                <Text style={[styles.courseButtonText, selectedCourse === kur && styles.courseButtonTextActive]}>{kur} KURU</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sınavlar (Quiz & Vize)</Text>
          <View style={styles.gridContainer}>
            {grades.quiz.map((v, i) => (
              <View key={`q${i}`} style={styles.inputItem}><Text style={styles.inputLabel}>Q{i+1}</Text>
              <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#666" value={v} onChangeText={(val) => handleInputChange('quiz', i, val)} maxLength={3}/></View>
            ))}
            {grades.vize.map((v, i) => (
              <View key={`v${i}`} style={styles.inputItem}><Text style={styles.inputLabel}>V{i+1}</Text>
              <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#666" value={v} onChangeText={(val) => handleInputChange('vize', i, val)} maxLength={3}/></View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Diğer Notlar</Text>
          <View style={styles.gridContainer}>
            {[ { k: 'writing', l: 'Writing' }, { k: 'sunum', l: 'Sunum' }, { k: 'kanaat', l: 'Kanaat' }, { k: 'odev', l: 'Ödev' } ].map((item) => (
              <View key={item.k} style={styles.halfGrid}><Text style={styles.inputLabel}>{item.l}</Text>
              <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#666" value={grades[item.k]} onChangeText={(val) => handleInputChange(item.k, null, val)} maxLength={3}/></View>
            ))}
          </View>
        </View>

        {targetNote && (
          <View style={[styles.targetBox, { backgroundColor: targetNote.type === 'fail' ? '#ef444420' : '#a855f720' }]}>
            <Text style={[styles.targetText, { color: targetNote.type === 'fail' ? '#ef4444' : '#c084fc' }]}>{targetNote.text}</Text>
          </View>
        )}

        <View style={styles.twoColumnContainer}>
          <View style={[styles.section, styles.flex]}><Text style={styles.sectionLabel}>Final</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#666" value={grades.final} onChangeText={(val) => handleInputChange('final', null, val)} maxLength={3}/></View>
          <View style={[styles.section, styles.flex]}><Text style={styles.sectionLabel}>Bütünleme</Text>
          <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#666" value={grades.butunleme} onChangeText={(val) => handleInputChange('butunleme', null, val)} maxLength={3}/></View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.calculateButton} onPress={calculateGrade}><Text style={styles.calculateButtonText}>Hesapla</Text></TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}><Text style={styles.resetButtonText}>Sıfırla</Text></TouchableOpacity>
        </View>

        {results && (
          <View style={[styles.resultsContainer, { borderTopColor: getResultColor(results) }]}>
            <Text style={[styles.resultStatusText, { color: getResultColor(results) }]}>{results.durum}</Text>
            <Text style={styles.resultNumber}>Ort: {results.ortalama}</Text>
            <Text style={styles.resultDetail}>{results.detay}</Text>
          </View>
        )}

        <View style={styles.footer}><Text style={styles.footerText}>Created by Alparslan Soyak</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContent: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 10 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#c084fc' },
  section: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  sectionLabel: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginBottom: 10, opacity: 0.8 },
  courseButtons: { flexDirection: 'row', gap: 8 },
  courseButton: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#334155', alignItems: 'center' },
  courseButtonActive: { backgroundColor: '#a855f7' },
  courseButtonText: { color: '#94a3b8', fontWeight: 'bold', fontSize: 12 },
  courseButtonTextActive: { color: '#fff' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  halfGrid: { width: '48%' },
  inputItem: { width: '23%' },
  inputLabel: { color: '#94a3b8', fontSize: 10, marginBottom: 4 },
  input: { backgroundColor: '#0f172a', borderRadius: 8, padding: 10, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  targetBox: { padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#a855f740' },
  targetText: { fontSize: 13, fontWeight: 'bold' },
  twoColumnContainer: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  buttonContainer: { flexDirection: 'row', gap: 12, marginVertical: 12 },
  calculateButton: { flex: 1, backgroundColor: '#a855f7', padding: 14, borderRadius: 12, alignItems: 'center' },
  calculateButtonText: { color: '#fff', fontWeight: 'bold' },
  resetButton: { flex: 1, backgroundColor: '#334155', padding: 14, borderRadius: 12, alignItems: 'center' },
  resetButtonText: { color: '#fff', fontWeight: 'bold' },
  resultsContainer: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, borderTopWidth: 3, marginTop: 10 },
  resultStatusText: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  resultNumber: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  resultDetail: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
  footer: { alignItems: 'center', marginTop: 20, paddingBottom: 20 },
  footerText: { color: '#475569', fontSize: 11 }
});
              
