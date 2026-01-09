'use client';

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { documentStyles as styles, formatKoreanDate } from '@/lib/documents/documentStyles';

interface Seosik1Data {
    schoolName: string;           // 학교명
    draftNumber: string;          // 기안 문서 번호 (예: OO초-1234)
    draftDate: string;            // 기안 날짜
    hiringReason: string;         // 채용 사유 (예: 휴직, 파견 등)
    originalTeacherName?: string; // 해당 교사명 (휴직자 이름)
    subject: string;              // 임용 분야 (예: 수학)
    contractStart: string;        // 계약 시작일
    contractEnd: string;          // 계약 종료일
    additionalNotes?: string;     // 기타 사항
}

export default function Seosik1_HiringPlan({ data }: { data: Seosik1Data }) {
    const today = formatKoreanDate(new Date());

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={{ marginBottom: 40 }}>
                    <Text style={styles.header}>기간제교원 채용계획(안)</Text>
                    <Text style={{ fontSize: 9, textAlign: 'right', color: '#666' }}>
                        문서번호: {data.draftNumber}
                    </Text>
                </View>

                {/* Main Content */}
                <View>
                    <Text style={styles.text}>
                        <Text style={styles.bold}>관련:</Text> {data.schoolName}-0000({data.draftDate}) 『교사 {data.originalTeacherName || 'OOO'} {data.hiringReason}』
                    </Text>
                    <Text style={{ ...styles.text, marginTop: 15 }}>
                        결원에 따라 다음과 같이 기간제교원을 채용하고자 합니다.
                    </Text>
                </View>

                {/* Details Section */}
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.subheader}>가. 채용 개요</Text>

                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableRowHeader]}>
                            <Text style={styles.tableCell}>항목</Text>
                            <Text style={styles.tableCellLast}>내용</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>임용 분야</Text>
                            <Text style={styles.tableCellLast}>{data.subject}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>채용 사유</Text>
                            <Text style={styles.tableCellLast}>{data.hiringReason}</Text>
                        </View>
                        <View style={styles.tableRow}>
                            <Text style={styles.tableCell}>임용 기간</Text>
                            <Text style={styles.tableCellLast}>
                                {formatKoreanDate(data.contractStart)} ~ {formatKoreanDate(data.contractEnd)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Procedure Section */}
                <View style={{ marginTop: 30 }}>
                    <Text style={styles.subheader}>나. 채용 절차</Text>
                    <Text style={styles.text}>1) 공고 게재 (도교육청 홈페이지, 학교 홈페이지)</Text>
                    <Text style={styles.text}>2) 1차 서류 심사</Text>
                    <Text style={styles.text}>3) 2차 면접 심사 (필수)</Text>
                    <Text style={styles.text}>4) 최종 결과 발표 및 임용</Text>
                </View>

                {/* Additional Notes */}
                {data.additionalNotes && (
                    <View style={{ marginTop: 30 }}>
                        <Text style={styles.subheader}>다. 기타 사항</Text>
                        <Text style={styles.text}>{data.additionalNotes}</Text>
                    </View>
                )}

                {/* Signature Box */}
                <View style={styles.signatureBox}>
                    <View style={styles.signatureItem}>
                        <Text style={styles.signatureLabel}>담당</Text>
                        <View style={styles.signatureStamp}>
                            <Text>(인)</Text>
                        </View>
                    </View>
                    <View style={styles.signatureItem}>
                        <Text style={styles.signatureLabel}>교감</Text>
                        <View style={styles.signatureStamp}>
                            <Text>(인)</Text>
                        </View>
                    </View>
                    <View style={styles.signatureItem}>
                        <Text style={styles.signatureLabel}>교장</Text>
                        <View style={styles.signatureStamp}>
                            <Text>(인)</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    본 문서는 Schoolit 시스템을 통해 {today}에 생성되었습니다. | schoolit.shop
                </Text>
            </Page>
        </Document>
    );
}
