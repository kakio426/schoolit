'use client';

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { documentStyles as styles, formatKoreanDate, formatKoreanCurrency } from '@/lib/documents/documentStyles';

interface Seosik16Data {
    // Contract Parties
    schoolName: string;           // 사용자 (학교명)
    principalName: string;        // 학교장명
    teacherName: string;          // 근로자 (교사명)
    teacherBirthDate: string;     // 생년월일 (주민번호 대신)
    teacherAddress?: string;      // 주소 (선택)

    // Contract Terms
    contractStart: string;        // 계약 시작일
    contractEnd: string;          // 계약 종료일
    subject: string;              // 담당 과목
    salaryStep: number;           // 호봉

    // Optional
    contractDate?: string;        // 계약 체결일
    workLocation?: string;        // 근무 장소
}

export default function Seosik16_Contract({ data }: { data: Seosik16Data }) {
    const contractDate = data.contractDate ? formatKoreanDate(data.contractDate) : formatKoreanDate(new Date());

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Text style={styles.header}>기간제교원 채용계약서</Text>

                {/* Parties */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제1조 (계약 당사자)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        사용자(이하 "갑"): {data.schoolName} 학교장 {data.principalName}
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        근로자(이하 "을"): {data.teacherName} (생년월일: {data.teacherBirthDate})
                    </Text>
                </View>

                {/* Contract Period */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제2조 (근무 장소)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        {data.workLocation || data.schoolName}
                    </Text>
                </View>

                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제3조 (계약 기간)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        {formatKoreanDate(data.contractStart)} ~ {formatKoreanDate(data.contractEnd)}
                    </Text>
                </View>

                {/* Work Details */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제4조 (담당 업무)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        {data.subject} 과목 교과 지도 및 교무 분장에 따른 업무
                    </Text>
                </View>

                {/* Salary */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제5조 (호봉 및 보수)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        근로자의 호봉은 {data.salaryStep}호봉이며, 보수는 「공무원보수규정」 별표 11에 따른다.
                    </Text>
                </View>

                {/* Working Hours */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제6조 (근무 시간)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        1일 8시간, 1주 40시간을 기준으로 하며, 수업 시간표에 따른다.
                    </Text>
                </View>

                {/* Leave */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제7조 (휴가)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20 }}>
                        「근로기준법」에 따른 연차 유급휴가를 부여한다.
                    </Text>
                </View>

                {/* Other Terms */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>제8조 (계약의 해지)</Text>
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 20, fontSize: 9 }}>
                        본 계약은 다음 각 호에 해당하는 경우 해지될 수 있다.
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 30, fontSize: 9 }}>
                        1. 결격사유 발생 시
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 30, fontSize: 9 }}>
                        2. 휴직 교원의 조기 복직 시
                    </Text>
                    <Text style={{ ...styles.text, marginLeft: 30, fontSize: 9 }}>
                        3. 쌍방 합의에 의한 해지
                    </Text>
                </View>

                {/* Agreement Statement */}
                <View style={{ marginTop: 40, marginBottom: 30 }}>
                    <Text style={{ ...styles.text, textAlign: 'center' }}>
                        위와 같이 근로계약을 체결하고, 이 계약서를 2통 작성하여 "갑"과 "을"이 각각 1통씩 보관한다.
                    </Text>
                </View>

                {/* Date */}
                <View style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Text style={styles.text}>{contractDate}</Text>
                </View>

                {/* Signatures */}
                <View style={{ marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 }}>
                        <View style={{ width: '45%' }}>
                            <Text style={styles.text}>"갑" (사용자)</Text>
                            <Text style={{ ...styles.text, marginTop: 10 }}>학교명: {data.schoolName}</Text>
                            <Text style={styles.text}>학교장: {data.principalName} (인)</Text>
                        </View>
                        <View style={{ width: '45%' }}>
                            <Text style={styles.text}>"을" (근로자)</Text>
                            <Text style={{ ...styles.text, marginTop: 10 }}>성 명: {data.teacherName}</Text>
                            <Text style={styles.text}>생년월일: {data.teacherBirthDate} (서명)</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    본 문서는 Schoolit 시스템을 통해 생성되었습니다. | schoolit.shop
                </Text>
            </Page>
        </Document>
    );
}
