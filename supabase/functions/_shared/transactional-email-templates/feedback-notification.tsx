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

interface FeedbackEmailProps {
  rating?: string
  improvementText?: string | null
  appVersion?: string | null
  roundsCompleted?: number | null
  createdAt?: string
  userId?: string | null
  userName?: string | null
  submitterName?: string | null
  userAvatar?: string | null
  userAgent?: string | null
  language?: string | null
  pageUrl?: string | null
}

export const FeedbackNotificationEmail = ({
  rating = 'غير محدد',
  improvementText,
  appVersion,
  roundsCompleted,
  createdAt,
  userId,
  userName,
  userAvatar,
  userAgent,
  language,
  pageUrl,
}: FeedbackEmailProps) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-GB', {
        timeZone: 'Asia/Amman',
      })
    : 'now'

  const displayName = userName?.trim() || 'مستخدم بدون اسم'

  return (
    <Html>
      <Head />
      <Preview>
        تقييم جديد من {displayName}: {rating}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>⚡ تقييم جديد وصل!</Heading>

          <Section style={userCard}>
            <Text style={userTitle}>
              {userAvatar ?? '👤'} {displayName}
            </Text>
            {userId && (
              <Text style={userMeta}>
                <strong>ID:</strong> <span style={mono}>{userId}</span>
              </Text>
            )}
          </Section>

          <Section style={section}>
            <Text style={label}>التقييم:</Text>
            <Text style={ratingStyle}>{rating}</Text>
          </Section>

          {improvementText && improvementText.trim().length > 0 && (
            <Section style={section}>
              <Text style={label}>اقتراحات / ملاحظات:</Text>
              <Text style={comment}>{improvementText}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={metaSection}>
            <Text style={meta}>
              <strong>الجولات المكتملة:</strong>{' '}
              {roundsCompleted ?? 'غير معروف'}
            </Text>
            <Text style={meta}>
              <strong>إصدار التطبيق:</strong> {appVersion ?? 'غير معروف'}
            </Text>
            <Text style={meta}>
              <strong>اللغة:</strong> {language ?? 'غير معروف'}
            </Text>
            {pageUrl && (
              <Text style={meta}>
                <strong>الصفحة:</strong> {pageUrl}
              </Text>
            )}
            {userAgent && (
              <Text style={metaSmall}>
                <strong>الجهاز:</strong> {userAgent}
              </Text>
            )}
            <Text style={meta}>
              <strong>الوقت (عمّان):</strong> {formattedDate}
            </Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            فعاليات — Powered by Hamza Tarkhan
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,sans-serif',
}
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '24px',
  maxWidth: '560px',
  borderRadius: '8px',
}
const h1 = {
  color: '#1a1a1a',
  fontSize: '22px',
  fontWeight: '700',
  textAlign: 'center' as const,
  margin: '0 0 16px',
}
const section = { padding: '8px 0' }
const userCard = {
  backgroundColor: '#eef2ff',
  border: '1px solid #c7d2fe',
  borderRadius: '8px',
  padding: '12px 14px',
  margin: '0 0 12px',
}
const userTitle = {
  color: '#1e293b',
  fontSize: '17px',
  fontWeight: '700',
  margin: '0 0 4px',
}
const userMeta = {
  color: '#475569',
  fontSize: '12px',
  margin: '0',
}
const mono = {
  fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
  fontSize: '11px',
  color: '#334155',
}
const label = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0 0 4px',
  fontWeight: '600',
}
const ratingStyle = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
}
const comment = {
  color: '#1f2937',
  fontSize: '15px',
  lineHeight: '1.6',
  backgroundColor: '#f3f4f6',
  padding: '12px',
  borderRadius: '6px',
  margin: '0',
}
const metaSection = { padding: '8px 0' }
const meta = {
  color: '#374151',
  fontSize: '13px',
  margin: '4px 0',
}
const metaSmall = {
  color: '#6b7280',
  fontSize: '11px',
  margin: '4px 0',
  wordBreak: 'break-all' as const,
}
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}

export const template: TemplateEntry = {
  component: FeedbackNotificationEmail,
  subject: (data: FeedbackEmailProps) =>
    `⚡ تقييم جديد من ${data.userName?.trim() || 'مستخدم'}: ${data.rating ?? 'غير محدد'}`,
  displayName: 'Feedback Notification',
  to: 'Hamzatarakhan2000@gmail.com',
  previewData: {
    rating: 'رائع',
    improvementText: 'حلو كتير بس بدنا ألعاب أكثر',
    appVersion: '1.0.0',
    roundsCompleted: 5,
    createdAt: new Date().toISOString(),
    userId: '00000000-0000-0000-0000-000000000000',
    userName: 'حمزة',
    userAvatar: '🦊',
    userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15',
    language: 'ar',
    pageUrl: 'https://imposter.my/',
  },
}
