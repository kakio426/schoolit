import { Font, StyleSheet } from '@react-pdf/renderer';

// Register Korean Font from Google Fonts (Local Files)
Font.register({
    family: 'NanumGothic',
    fonts: [
        {
            src: '/fonts/NanumGothic-Regular.ttf',
            fontWeight: 'normal',
        },
        {
            src: '/fonts/NanumGothic-Bold.ttf',
            fontWeight: 'bold',
        },
    ],
});

// Common Document Styles
export const documentStyles = StyleSheet.create({
    page: {
        fontFamily: 'NanumGothic',
        fontSize: 11,
        padding: 50,
        lineHeight: 1.6,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    subheader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    text: {
        fontSize: 11,
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        fontSize: 9,
        color: '#666',
        textAlign: 'center',
        borderTop: '1px solid #ccc',
        paddingTop: 10,
    },
    table: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 10,
        marginBottom: 10,
        border: '1px solid #333',
    },
    tableRow: {
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid #333',
    },
    tableRowHeader: {
        backgroundColor: '#f0f0f0',
    },
    tableCell: {
        flex: 1,
        padding: 8,
        fontSize: 10,
        borderRight: '1px solid #333',
    },
    tableCellLast: {
        flex: 1,
        padding: 8,
        fontSize: 10,
    },
    watermark: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-45deg)',
        fontSize: 60,
        color: '#eee',
        opacity: 0.3,
    },
    signatureBox: {
        marginTop: 40,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    signatureItem: {
        textAlign: 'center',
        marginLeft: 30,
        width: 80,
    },
    signatureLabel: {
        fontSize: 9,
        marginBottom: 5,
    },
    signatureStamp: {
        width: 60,
        height: 60,
        border: '1px dashed #999',
        borderRadius: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 8,
        color: '#999',
    },
});

// Date Formatter for Official Documents (YYYY. MM. DD.)
export function formatKoreanDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}. ${month}. ${day}.`;
}

// Currency Formatter
export function formatKoreanCurrency(amount: number): string {
    return `₩ ${amount.toLocaleString('ko-KR')}`;
}
