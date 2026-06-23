import { jsPDF } from "jspdf";
import type { Registro } from "@/services/api";

type DadosCertificado = {
  participante: string;
  horasTotais: number;
  registros: Registro[];
  dataInicio?: string;
  dataFim?: string;
};

function formatarData(data: string): string {
  return new Date(data + "T12:00:00").toLocaleDateString("pt-BR");
}

function formatarHoras(horas: number): string {
  return `${horas.toLocaleString("pt-BR")} ${horas === 1 ? "hora" : "horas"}`;
}

export function gerarCertificadoPDF(dados: DadosCertificado): void {
  const doc = new jsPDF();
  const largura = doc.internal.pageSize.getWidth();
  const centro = largura / 2;
  let y = 30;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("CERTIFICADO", centro, y, { align: "center" });

  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Projeto Meninas Digitais - UTFPR Cornélio Procópio", centro, y, { align: "center" });

  y += 8;
  doc.setDrawColor(150);
  doc.line(20, y, largura - 20, y);

  y += 16;
  doc.setFontSize(13);
  const corpo =
    `Certificamos que ${dados.participante} participou das atividades do ` +
    `projeto Meninas Digitais da UTFPR, totalizando ${formatarHoras(dados.horasTotais)}.`;
  const linhas = doc.splitTextToSize(corpo, largura - 40);
  doc.text(linhas, 20, y);
  y += linhas.length * 7 + 6;

  if (dados.dataInicio || dados.dataFim) {
    const inicio = dados.dataInicio ? formatarData(dados.dataInicio) : "início";
    const fim = dados.dataFim ? formatarData(dados.dataFim) : "hoje";
    doc.setFontSize(11);
    doc.text(`Período: ${inicio} a ${fim}`, 20, y);
    y += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Atividades", 20, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const r of dados.registros) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const descricao = r.description ? `: ${r.description}` : "";
    const linha = `• ${formatarData(r.date)}, ${r.type}, ${r.hours}h${descricao}`;
    const partes = doc.splitTextToSize(linha, largura - 40);
    doc.text(partes, 20, y);
    y += partes.length * 5 + 1;
  }

  y += 8;
  if (y > 270) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Emitido em ${new Date().toLocaleDateString("pt-BR")}`, 20, y);

  const slug = dados.participante
    .normalize("NFD")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/ +/g, "-");
  const nomeArquivo = `certificado-${slug}.pdf`;
  doc.save(nomeArquivo);
}
