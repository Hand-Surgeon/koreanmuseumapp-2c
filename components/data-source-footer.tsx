import type { Language } from "@/types/language"

interface FooterCopy {
  source: string
  conditions: string
  dataset: string
  license: string
}

const footerCopy: Record<Language, FooterCopy> = {
  ko: {
    source: "자료 출처: 문화체육관광부 국립중앙박물관 e뮤지엄",
    conditions: "메타데이터와 이미지의 이용조건은 항목별로 다를 수 있으므로 상세 페이지의 출처·권리 정보를 확인하세요.",
    dataset: "공공데이터 상품",
    license: "공공누리 안내",
  },
  en: {
    source: "Data source: eMuseum, National Museum of Korea, Ministry of Culture, Sports and Tourism",
    conditions: "Metadata and image rights may differ by item. Check the source and rights section on each detail page.",
    dataset: "Public-data product",
    license: "KOGL guidance",
  },
  zh: {
    source: "资料来源：韩国文化体育观光部、韩国国立中央博物馆 eMuseum",
    conditions: "元数据与图片的使用条件可能因文物而异，请查看详情页中的来源与权利信息。",
    dataset: "公共数据产品",
    license: "公共著作物许可说明",
  },
  ja: {
    source: "資料出典：韓国文化体育観光部・韓国国立中央博物館 eMuseum",
    conditions: "メタデータと画像の利用条件は資料ごとに異なる場合があります。詳細ページの出典・権利情報をご確認ください。",
    dataset: "公共データ商品",
    license: "KOGL案内",
  },
  th: {
    source: "แหล่งข้อมูล: eMuseum พิพิธภัณฑสถานแห่งชาติเกาหลี กระทรวงวัฒนธรรม กีฬา และการท่องเที่ยว",
    conditions: "เงื่อนไขการใช้ข้อมูลเมตาและภาพอาจแตกต่างกันในแต่ละรายการ โปรดตรวจสอบข้อมูลแหล่งที่มาและสิทธิ์ในหน้ารายละเอียด",
    dataset: "ชุดข้อมูลสาธารณะ",
    license: "คำแนะนำ KOGL",
  },
}

export function DataSourceFooter({ locale }: { locale: Language }) {
  const copy = footerCopy[locale]

  return (
    <footer className="border-t bg-slate-950 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm leading-6 sm:px-6 lg:px-8">
        <p className="font-medium">{copy.source}</p>
        <p className="mt-1 text-slate-400">{copy.conditions}</p>
        <nav aria-label={copy.source} className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <a
            href="https://www.data.go.kr/data/3036708/openapi.do"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-slate-500 underline-offset-4 hover:text-white"
          >
            {copy.dataset}
          </a>
          <a
            href="https://www.kogl.or.kr/info/license.do"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-slate-500 underline-offset-4 hover:text-white"
          >
            {copy.license}
          </a>
        </nav>
      </div>
    </footer>
  )
}
