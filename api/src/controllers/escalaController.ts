import { Request, Response } from 'express';
import Escala from '../models/Escala';

const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const temConflito = async (dias: string[], start: string, end: string, excludeId: string | null = null) => {
  const s1 = toMins(start); const e1 = toMins(end);
  const intervalos1 = s1 < e1 ? [[s1, e1]] : [[s1, 1440], [0, e1]]; // Resolve turnos que viram a noite (ex: 22:00 as 06:00)

  const query = excludeId ? { _id: { $ne: excludeId }, dias: { $in: dias } } : { dias: { $in: dias } };
  const escalasExistentes = await Escala.find(query);

  for (const esc of escalasExistentes) {
    const s2 = toMins(esc.horaInicio); const e2 = toMins(esc.horaFim);
    const intervalos2 = s2 < e2 ? [[s2, e2]] : [[s2, 1440], [0, e2]];

    for (let [startA, endA] of intervalos1) {
      for (let [startB, endB] of intervalos2) {
        if (startA < endB && endA > startB) return true; // Deu conflito!
      }
    }
  }
  return false;
};

export const getEscalas = async (req: Request, res: Response) => {
  try {
    const escalas = await Escala.find().sort({ createdAt: -1 });
    res.status(200).json(escalas);
  } catch (erro) { res.status(500).json({ erro: 'Erro ao buscar escalas' }); }
};

export const createEscala = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dias, horaInicio, horaFim } = req.body;
    if (await temConflito(dias, horaInicio, horaFim)) {
      res.status(400).json({ erro: 'Já existe um segurança escalado para este horário nestes dias!' });
      return;
    }
    const novaEscala = await Escala.create(req.body);
    res.status(201).json(novaEscala);
  } catch (erro) { res.status(500).json({ erro: 'Erro ao criar escala' }); }
};

export const updateEscala = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dias, horaInicio, horaFim } = req.body;
    if (await temConflito(dias, horaInicio, horaFim, id)) {
      res.status(400).json({ erro: 'O horário atualizado conflita com outro segurança!' });
      return;
    }
    const escalaAtualizada = await Escala.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(escalaAtualizada);
  } catch (erro) { res.status(500).json({ erro: 'Erro ao atualizar escala' }); }
};

export const getEscalaAtiva = async (req: Request, res: Response) => {
  try {
    const agora = new Date();
    const formatador = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', weekday: 'long' });
    const partes = formatador.formatToParts(agora);
    
    let diaAtual = partes.find(p => p.type === 'weekday')?.value || '';
    diaAtual = diaAtual.charAt(0).toUpperCase() + diaAtual.slice(1).replace('-feira', ''); // Deixa 'Segunda'
    const horaMinuto = partes.find(p => p.type === 'hour')?.value + ':' + partes.find(p => p.type === 'minute')?.value;

    const escalasDoDia = await Escala.find({ dias: diaAtual });
    const minAtual = toMins(horaMinuto);

    let escalaAtiva = null;
    for (const esc of escalasDoDia) {
      const start = toMins(esc.horaInicio); const end = toMins(esc.horaFim);
      if (start < end) {
        if (minAtual >= start && minAtual <= end) escalaAtiva = esc;
      } else { // Vira a noite
        if (minAtual >= start || minAtual <= end) escalaAtiva = esc;
      }
    }

    res.status(200).json(escalaAtiva);
  } catch (erro) { res.status(500).json({ erro: 'Erro ao buscar ativo' }); }
};