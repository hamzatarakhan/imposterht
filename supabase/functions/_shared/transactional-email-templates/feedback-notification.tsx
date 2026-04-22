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

// Map raw rating keys to friendly Arabic labels + emoji + accent color.
const RATING_META: Record<
  string,
  { label: string; emoji: string; color: string; bg: string }
> = {
  amazing: { label: 'حلو', emoji: '✨', color: '#1d4ed8', bg: '#dbeafe' },
  more_amazing: { label: 'كتير حلو', emoji: '🔥', color: '#c2410c', bg: '#ffedd5' },
  khoz3boli: { label: 'خزعبلي', emoji: '🤯', color: '#7c3aed', bg: '#ede9fe' },
  salat_nabi: { label: 'صلّي عالنبي', emoji: '💯', color: '#15803d', bg: '#dcfce7' },
  needs_improvement: {
    label: 'بدها شغل',
    emoji: '🛠️',
    color: '#b91c1c',
    bg: '#fee2e2',
  },
}

export const FeedbackNotificationEmail = ({
  rating = 'غير محدد',
  improvementText,
  appVersion,
  roundsCompleted,
  createdAt,
  userId,
  userName,
  submitterName,
  userAvatar,
  userAgent,
  language,
  pageUrl,
}: FeedbackEmailProps) => {
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleString('en-GB', {
        timeZone: 'Asia/Amman',
      })
    : '—'

  const trimmedSubmitter = submitterName?.trim() || null
  const trimmedUserName = userName?.trim() || null
  const displayName = trimmedSubmitter || trimmedUserName || 'مستخدم بدون اسم'
  const avatar = userAvatar || '👤'

  const ratingMeta = RATING_META[rating] || {
    label: rating,
    emoji: '⭐',
    color: '#0f172a',
    bg: '#f1f5f9',
  }

  const hasImprovement = !!(improvementText && improvementText.trim().length > 0)
  const namesDiffer =
    trimmedSubmitter && trimmedUserName && trimmedSubmitter !== trimmedUserName
  const isNegative = rating === 'needs_improvement'

  return (
    <Html lang="ar" dir="rtl">
      <Head />
      <Preview>
        {ratingMeta.emoji} تقييم جديد من {displayName} — {ratingMeta.label}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brand}>⚡ فعاليات</Text>
            <Heading style={h1}>تقييم جديد وصل!</Heading>
            <Text style={subHeader}>
              {isNegative
                ? 'في ملاحظة للتحسين 👇'
                : 'الناس مبسوطة بالتطبيق 🎉'}
            </Text>
          </Section>

          {/* Rating badge */}
          <Section style={{ textAlign: 'center', margin: '0 0 20px' }}>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: ratingMeta.bg,
                color: ratingMeta.color,
                fontSize: '20px',
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: '12px',
                lineHeight: 1,
              }}
            >
              {ratingMeta.emoji} {ratingMeta.label}
            </div>
          </Section>

          {/* User card */}
          <Section style={card}>
            <Text style={cardLabel}>المستخدم</Text>
            <Text style={userTitle}>
              {avatar} {displayName}
            </Text>

            {trimmedSubmitter && (
              <div style={infoRow}>
                <span style={infoKey}>✍️ كتب اسمه بالتقييم</span>
                <span style={infoVal}>{trimmedSubmitter}</span>
              </div>
            )}
            {namesDiffer && (
              <div style={infoRow}>
                <span style={infoKey}>👤 اسم الحساب</span>
                <span style={infoVal}>{trimmedUserName}</span>
              </div>
            )}
            {!trimmedSubmitter && trimmedUserName && (
              <div style={infoRow}>
                <span style={infoKey}>👤 اسم الحساب</span>
                <span style={infoVal}>{trimmedUserName}</span>
              </div>
            )}
            {userId && (
              <div style={infoRow}>
                <span style={infoKey}>🆔 المعرّف</span>
                <span style={{ ...infoVal, ...mono }}>{userId}</span>
              </div>
            )}
          </Section>

          {/* Improvement text — only if needs_improvement */}
          {hasImprovement && (
            <Section style={improvementCard}>
              <Text style={cardLabel}>💬 الاقتراحات / الملاحظات</Text>
              <Text style={comment}>{improvementText}</Text>
            </Section>
          )}

          {/* Meta details */}
          <Section style={metaCard}>
            <Text style={cardLabel}>📊 تفاصيل الجلسة</Text>

            <div style={infoRow}>
              <span style={infoKey}>🎮 الجولات المكتملة</span>
              <span style={infoVal}>{roundsCompleted ?? '—'}</span>
            </div>
            <div style={infoRow}>
              <span style={infoKey}>📦 إصدار التطبيق</span>
              <span style={infoVal}>{appVersion ?? '—'}</span>
            </div>
            <div style={infoRow}>
              <span style={infoKey}>🌐 اللغة</span>
              <span style={infoVal}>{language ?? '—'}</span>
            </div>
            <div style={infoRow}>
              <span style={infoKey}>🕒 الوقت (عمّان)</span>
              <span style={infoVal}>{formattedDate}</span>
            </div>
            {pageUrl && (
              <div style={infoRow}>
                <span style={infoKey}>🔗 الصفحة</span>
                <span style={{ ...infoVal, wordBreak: 'break-all' as const }}>
                  {pageUrl}
                </span>
              </div>
            )}
            {userAgent && (
              <div style={{ ...infoRow, alignItems: 'flex-start' }}>
                <span style={infoKey}>📱 الجهاز</span>
                <span
                  style={{
                    ...infoVal,
                    fontSize: '11px',
                    color: '#64748b',
                    wordBreak: 'break-all' as const,
                  }}
                >
                  {userAgent}
                </span>
              </div>
            )}
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
  padding: '24px 12px',
}
const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '560px',
}
const header = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
const brand = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  margin: '0 0 8px',
}
const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: 800,
  textAlign: 'center' as const,
  margin: '0 0 6px',
}
const subHeader = {
  color: '#64748b',
  fontSize: '13px',
  margin: '0',
}
const card = {
  backgroundColor: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  margin: '0 0 14px',
}
const improvementCard = {
  backgroundColor: '#fffbeb',
  border: '1px solid #fde68a',
  borderRadius: '12px',
  padding: '16px',
  margin: '0 0 14px',
}
const metaCard = {
  backgroundColor: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
  margin: '0 0 14px',
}
const cardLabel = {
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 10px',
}
const userTitle = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: 700,
  margin: '0 0 12px',
}
const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  padding: '6px 0',
  borderTop: '1px solid #f1f5f9',
}
const infoKey = {
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600,
  flexShrink: 0,
}
const infoVal = {
  color: '#0f172a',
  fontSize: '13px',
  fontWeight: 500,
  textAlign: 'left' as const,
}
const mono = {
  fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace',
  fontSize: '11px',
  color: '#334155',
}
const comment = {
  color: '#1f2937',
  fontSize: '15px',
  lineHeight: '1.7',
  backgroundColor: '#ffffff',
  border: '1px solid #fde68a',
  padding: '14px',
  borderRadius: '8px',
  margin: '0',
  whiteSpace: 'pre-wrap' as const,
}
const hr = { borderColor: '#e5e7eb', margin: '20px 0 12px' }
const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}

export const template: TemplateEntry = {
  component: FeedbackNotificationEmail,
  subject: (data: FeedbackEmailProps) => {
    const meta = RATING_META[data.rating ?? '']
    const ratingLabel = meta ? `${meta.emoji} ${meta.label}` : (data.rating ?? 'غير محدد')
    const name = data.submitterName?.trim() || data.userName?.trim() || 'مستخدم'
    return `⚡ تقييم جديد من ${name} — ${ratingLabel}`
  },
  displayName: 'Feedback Notification',
  to: 'Hamzatarakhan2000@gmail.com',
  previewData: {
    rating: 'more_amazing',
    improvementText: 'حلو كتير بس بدنا ألعاب أكثر',
    appVersion: '1.0.0',
    roundsCompleted: 5,
    createdAt: new Date().toISOString(),
    userId: '00000000-0000-0000-0000-000000000000',
    userName: 'حمزة',
    submitterName: 'أبو حمزة',
    userAvatar: '🦊',
    userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15',
    language: 'ar',
    pageUrl: 'https://imposter.my/',
  },
}
