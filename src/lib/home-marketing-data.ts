import type { SocialPlatformId } from "@/components/home/social-brand";

export const HOME_HERO = {
  titleBefore: "Boost Your ",
  titleAccent: "Social Presence",
  titleAfter: " & Get Premium Access",
  subtitle:
    "The ultimate destination for high-end SMM services and elite digital accounts. Verified growth, instant delivery, and boutique quality.",
  badge: "Curator Market",
  ctaPrimary: "Get Started",
  ctaSecondary: "View All Services",
} as const;

export const HOME_STATS = [
  { label: "Avg. Growth Rate", value: "+450%", key: "growth" },
  { label: "Account Security", value: "100%", key: "security" },
  { label: "Instant Delivery", value: "< 5m", key: "delivery" },
  { label: "Active Customers", value: "50k+", key: "customers" },
] as const;

export const FEATURED_PACKAGES: {
  title: string;
  desc: string;
  price: string;
  wrap: string;
  brand: SocialPlatformId;
}[] = [
  {
    title: "TikTok Followers",
    desc: "Real high-quality accounts with rapid delivery.",
    price: "$2.99",
    wrap: "bg-black text-white",
    brand: "tiktok",
  },
  {
    title: "YouTube Subs",
    desc: "Safe, non-drop subscribers for channel growth.",
    price: "$12.50",
    wrap: "bg-[#FF0000] text-white",
    brand: "youtube",
  },
  {
    title: "Facebook Page Likes",
    desc: "Increase your brand credibility instantly.",
    price: "$4.20",
    wrap: "bg-[#1877F2] text-white",
    brand: "facebook",
  },
  {
    title: "X Followers",
    desc: "Boost your social authority on X ecosystem.",
    price: "$3.75",
    wrap: "bg-black text-white",
    brand: "x",
  },
];

export const HOW_IT_WORKS = [
  {
    n: "1",
    t: "Pick a Platform",
    d: "Choose from our wide range of social media networks and digital account types.",
  },
  {
    n: "2",
    t: "Fill the Info",
    d: "Provide the necessary details (Profile URL or Username) and secure payment.",
  },
  {
    n: "3",
    t: "See the Growth",
    d: "Relax while we process your order. Real-time growth happens within minutes.",
  },
] as const;

export const VALUE_PROPS: {
  iconKey: "gauge" | "wallet" | "star";
  title: string;
  desc: string;
  accent: string;
}[] = [
  {
    iconKey: "gauge",
    title: "Quick Results",
    desc: "Our automation system triggers your order delivery instantly, ensuring zero wait time.",
    accent: "bg-primary/10 text-primary",
  },
  {
    iconKey: "wallet",
    title: "Low Rates",
    desc: "Premium quality doesn't have to break the bank. We offer the best value in the SMM market.",
    accent: "bg-secondary/10 text-secondary",
  },
  {
    iconKey: "star",
    title: "High-Quality Services",
    desc: "Every account and signal we provide is vetted for authenticity and safety.",
    accent: "bg-tertiary/10 text-tertiary",
  },
];

export const TRUST_BLOCK = {
  headlineLead: "Trusted by over ",
  headlineAccent: "50,000+",
  headlineTrail: " global influencers.",
  statAValue: "750k+",
  statALabel: "Orders Completed",
  statBValue: "99.9%",
  statBLabel: "Satisfaction Rate",
} as const;

export const TESTIMONIAL = {
  quote:
    "Curator Market has been our primary source for boosting brand presence on TikTok. The quality of followers is unparalleled and the delivery is lightning fast.",
  name: "Sarah Jenkins",
  role: "Lifestyle Influencer @sarah.style",
} as const;

export const AVATAR_HERO = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuApak3_8KA-4jwrihHqrghN_TSfpjTXtDPdH9GAXdc9BIjg83yXHdQjh8vyIbLsfqHNLIlBBBU9iU2oSC_2oudBAJeeCk8p-3pKPk7KfGWnoSnHbzcygWMioS_YoOjz_a3TLRWd0F115jvRXCOWQT6plKpFI3U8AUHPhch5VbykrHzukFZxkFxVG0gWcO19L6cj0PpbXoKeApcJrSY8V9r1Hw8kkbCKxuexG_ENkjn16GmHmPKOZvf9x9g_tWJ23Ogg3ppoXzgT_ss",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC-CV5R-m5fE593uIoB9EXl7ZeRLUtWJsI2IJ7TigfuzsyxnGIfyDSL_EEy846AbpQIXXBkDRUs42pJaJBh-ep8gSiskorVGZR2Oa-_IT4c2Qo83wiqQkuw-bB-Qov_GCS4ZzZPNBNRoOeuv0fZGKWaJgEE4fJ_orLKm3ewVy6T1_B6mvUAymz0H48mS-65yDIvXw7z2EAWYe0-sUmgIL4RJYplcM08K94mVZBzD8ptK68ZKC1XwcPU5nwUFegQl_XzmRwEXsVjNaM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCUrX63UUpCknTUFW2eHM09x-w3pqypljM6GU6TkBmKCiKOoy1RtsbLKip6Q6ccTZ3HRgDF-T2nlyjjYX4aA6pB-tl0mrOcGO0GwcvsWN7u4hIninyqRS-bDT9ED3D1CySgmvztBYU3zdcJtf3N79G61urK9xHaodbl9eVJhfu1Uh6Xd4JjGeiNx4SK9pycDGT1xfL3EJe-oaULz-rHDom8T3HaIjHiA8STfaUpxS2dos6uGmTAaHNO9Iq7fOmjiUp1ugzCttTtCis",
] as const;

export const AVATAR_TESTIMONIAL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCud2IyK747qJqKq2oG1ToFveUq-vlAUip9URW6e3myowt_x0kgXHUKyRMS5xGtdQYYNmH1bMwpjz-1fju9NG8G14fCBs4qWEqrbksXp925LdaRq0GRP9VlXhfywwdq069jYF_y4CMczncS71b_ghoLeJ9QYag_H-Dg-aZUa5wXREm3w29dYNERiE21djB-Uz8VSMtNtf87wkaaWC1XZlcnFtwhXC9zafRqbLCb3CIF5JpqIELxm-dJFRrVEt_S4FKDkGh6y-03PeM";

/** Luminous-style hero visual (editorial) */
export const LUMINOUS_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDobEIKGMAVrVdSc4X1IsWDfLXRiYMS38oNLA_Fk_Di9YrwVsUUHV_52YnhmdRZKC_uEQmHuLMl6fX1hDknFJtdM5vqhvTJ99ojspRjumMfqveXiy-_idcMSBrSPLLn_AugUOEQae7FcNnv5ueW-hl6OcWa8X8_kngSXq2Z8mOUxXKIkuonceHaLKkoGKuJZ73X3PPIriODSNEzxfb9uRx5zd_PoeQiH-FKNqx0f_jHgpClhWE7GLHVFfDJ8Ex07Awa2iJzT_Pgb4bO";

export const BENTO_ANALYTICS_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDkwlZblIjCFib0v4QX5B50VxjuRRVyhEInyTmUVjedcADlNJWqh5iS675T_VFoYneVL_DONNsH-G0sDBnjjmRuMv-Cvp5TbOXT3iax2WITmrd-mlGqsmCu4Iv0aVd2BVQtLEYIRk6HIGIxjd576UuzMmlV-S3wG40ryIkhG7pZ5AVKyYUICzxnpsRXvfygpVaZKJatLF8yP1CkNIn8R9Jbxbr0nmDCYmOFRAR2X9atvX30yJttdx7LGXV0OeQv7mjj8vmIHi1Owma_";
