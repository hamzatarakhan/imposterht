/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'فعاليات'

interface FeedbackNotificationProps {
  ratingLabel?: string
  ratingEmoji?: string
  ratingId?: string
  improvementText?: string | null
  playerName?: string | null
  roundsCompleted?: number | null
  appVersion?: string | null
  userId?: string | null
  submittedAt?: string
}

const FeedbackNotificationEmail = ({
  ratingLabel = 'غير محدد',
  ratingEmoji = '⭐',
  ratingId = 'unknown',
  improvementText,
  playerName,
  roundsCompleted,
  appVersion,
  userId,
  submittedAt,
}: FeedbackNotificationProps) => (
  <Html lang="ar" dir="rtl">
    <Head />
    <Preview>
      تقييم جديد من {playerName || 'مستخدم'}: {ratingLabel}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>📬 تقييم جديد على {SITE_NAME}</Heading>

        <Section style={ratingBox}>
          <Text style={ratingEmojiStyle}>{ratingEmoji}</Text>
          <Text style={ratingLabelStyle}>{ratingLabel}</Text>
        </Section>

        <Section style={infoSection}>
          <Text style={infoRow}>
            <strong>اللاعب:</strong> {playerName || '— (مش مسجل اسم)'}
          </Text>
          <Text style={infoRow}>
            <strong>عدد الجولات:</strong>{' '}
            {roundsCompleted != null ? roundsCompleted : '—'}
          </Text>
          <Text style={infoRow}>
            <strong>إصدار التطبيق:</strong> {appVersion || '—'}
          </Text>
          <Text style={infoRow}>
            <strong>وقت الإرسال:</strong> {submittedAt || '—'}
          </Text>
          <Text style={infoRowMuted}>
            <strong>User ID:</strong> {userId || '—'}
          </Text>
          <Text style={infoRowMuted}>
            <strong>Rating ID:</strong> {ratingId}
          </Text>
        </Section>

        {improvementText && improvementText.trim().length > 0 && (
          <>
            <Hr style={hr} />
            <Heading as="h2" style={h2}>
              🛠️ التحسينات المقترحة
            </Heading>
            <Section style={textBox}>
              <Text style={improvementTextStyle}>{improvementText}</Text>
            </Section>
          </>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          هاي رسالة تلقائية من {SITE_NAME} — كل ما حدا قيّم التطبيق رح توصلك نسخة.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: FeedbackNotificationEmail,
  subject: (data: Record<string, any>) =>
    `📬 تقييم جديد (${data.ratingLabel || 'غير محدد'}) من ${data.playerName || 'مستخدم'}`,
  displayName: 'إشعار تقييم جديد',
  to: 'Hamzatarakhan2000@gmail.com',
  previewData: {
    ratingLabel: 'رائع',
    ratingEmoji: '✨',
    ratingId: 'amazing',
    improvementText: null,
    playerName: 'حمزة',
    roundsCompleted: 6,
    appVersion: '1.2.3',
    userId: 'abc-123-def',
    submittedAt: '2026-04-22 16:45',
  },
} satisfies TemplateEntry

const main: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Tahoma", "Arial", sans-serif',
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '32px 24px',
}

const h1: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '0 0 24px',
  textAlign: 'right',
}

const h2: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: '20px 0 12px',
  textAlign: 'right',
}

const ratingBox: React.CSSProperties = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  margin: '0 0 24px',
}

const ratingEmojiStyle: React.CSSProperties = {
  fontSize: '48px',
  margin: '0 0 8px',
  lineHeight: 1,
}

const ratingLabelStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#0f172a',
  margin: 0,
}

const infoSection: React.CSSProperties = {
  margin: '0 0 16px',
}

const infoRow: React.CSSProperties = {
  fontSize: '14px',
  color: '#334155',
  margin: '6px 0',
  textAlign: 'right',
  lineHeight: 1.6,
}

const infoRowMuted: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '6px 0',
  textAlign: 'right',
  lineHeight: 1.6,
  fontFamily: 'monospace',
}

const textBox: React.CSSProperties = {
  backgroundColor: '#fef9c3',
  border: '1px solid #fde047',
  borderRadius: '8px',
  padding: '16px',
  margin: '0 0 16px',
}

const improvementTextStyle: React.CSSProperties = {
  fontSize: '15px',
  color: '#422006',
  margin: 0,
  lineHeight: 1.7,
  textAlign: 'right',
  whiteSpace: 'pre-wrap',
}

const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '24px 0',
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '16px 0 0',
  textAlign: 'center',
}
