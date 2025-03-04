export const pageThicknessEmUnit = 1 / 32
export const pageThicknessWidthRate = 0.25
export const screenAspectThreshold = 7/8

export const photoBookHtml = {
  home: 'Home',
  title: `
    <span>自然風景写真集</span>
    <small>Hydrangea</small>
  `,
  explain: `
    趣味で撮影した自然風景写真をWebでフォトアルバムにしました。<br>
    ごゆっくり、お楽しみください。<br>
    <ul>
      <li>本サイトは実運用に向けたデモ版となっております。コメント等は投稿できませんのでご了承ください</li>
      <li>本サイトで掲載している写真の転載や二次使用はお断りしております。</li>
    </ul>
  `
} as const