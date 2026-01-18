// =================================================
// Adaptive Widget: Time Progress (Scriptable SAFE)
// =================================================

const widget = new ListWidget();
widget.backgroundColor = new Color("#1C1C1E");
widget.setPadding(12, 12, 12, 12);

const now = new Date();

// ---------- helpers ----------
function clamp(v) {
  return Math.max(0, Math.min(v, 1));
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function startOfWeek(d) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

function progress(start, end) {
  return clamp((now - start) / (end - start));
}

// ---------- ranges ----------
const dayStart = startOfDay(now);
const dayEnd = new Date(dayStart);
dayEnd.setDate(dayEnd.getDate() + 1);

const weekStart = startOfWeek(now);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekEnd.getDate() + 7);

const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

const yearStart = new Date(now.getFullYear(), 0, 1);
const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

// ---------- data ----------
const DATA = [
  { label: "Day",   p: progress(dayStart, dayEnd),     color: new Color("#FF3B30") },
  { label: "Week",  p: progress(weekStart, weekEnd),   color: new Color("#FF9500") },
  { label: "Month", p: progress(monthStart, monthEnd), color: new Color("#AF52DE") },
  { label: "Year",  p: progress(yearStart, yearEnd),   color: new Color("#5AC8FA") },
];

// ---------- draw circle ----------
function drawCircle(percent, color, size) {
  const stroke = Math.max(8, size * 0.12);
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;

  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;

  ctx.setStrokeColor(new Color(color.hex, 0.25));
  ctx.setLineWidth(stroke);
  ctx.strokeEllipse(new Rect(stroke / 2, stroke / 2, size - stroke, size - stroke));

  const path = new Path();
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * percent;
  const steps = 120;

  for (let i = 0; i <= steps; i++) {
    const a = start + (end - start) * (i / steps);
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) path.move(new Point(x, y));
    else path.addLine(new Point(x, y));
  }

  ctx.addPath(path);
  ctx.setStrokeColor(color);
  ctx.setLineWidth(stroke);
  ctx.strokePath();

  ctx.setFont(Font.boldSystemFont(size * 0.22));
  ctx.setTextColor(Color.white());
  ctx.setTextAlignedCenter();
  ctx.drawTextInRect(
    `${Math.floor(percent * 100)}%`,
    new Rect(0, cy - size * 0.15, size, size * 0.3)
  );

  return ctx.getImage();
}

// ---------- draw bar ----------
function drawBar(percent, color, width) {
  const h = 10;
  const ctx = new DrawContext();
  ctx.size = new Size(width, h);
  ctx.opaque = false;

  ctx.setFillColor(new Color("#2C2C2E"));
  ctx.fillRect(new Rect(0, 0, width, h));

  ctx.setFillColor(color);
  ctx.fillRect(new Rect(0, 0, width * percent, h));

  return ctx.getImage();
}

// ---------- layouts ----------
function buildSmall() {
  widget.addSpacer();
  const img = widget.addImage(drawCircle(DATA[0].p, DATA[0].color, 120));
  img.centerAlignImage();

  widget.addSpacer(6);
  const t = widget.addText("Day");
  t.font = Font.mediumSystemFont(14);
  t.textColor = Color.lightGray();
  t.centerAlignText();
  widget.addSpacer();
}

function buildMedium() {
  const title = widget.addText("Time Progress");
  title.font = Font.boldSystemFont(16);
  title.textColor = Color.white();

  widget.addSpacer(10);

  for (const i of DATA) {
    const row = widget.addStack();
    row.centerAlignContent();

    const l = row.addText(i.label);
    l.font = Font.mediumSystemFont(13);
    l.textColor = Color.lightGray();
    l.size = new Size(50, 0);

    row.addSpacer(6);

    const bar = row.addImage(drawBar(i.p, i.color, 160));
    bar.imageSize = new Size(160, 10);

    row.addSpacer(6);

    const p = row.addText(`${Math.floor(i.p * 100)}%`);
    p.font = Font.mediumSystemFont(12);
    p.textColor = Color.white();

    widget.addSpacer(8);
  }
}

function buildLarge() {
  const title = widget.addText("Time Progress");
  title.font = Font.boldSystemFont(20);
  title.textColor = Color.white();
  title.centerAlignText();

  widget.addSpacer(12);

  function addCircleItem(stack, item) {
    const col = stack.addStack();
    col.layoutVertically();
    col.centerAlignContent();

    const img = col.addImage(drawCircle(item.p, item.color, 100));
    img.imageSize = new Size(100, 100);

    col.addSpacer(6);

    const t = col.addText(item.label);
    t.font = Font.mediumSystemFont(14);
    t.textColor = Color.lightGray();
    t.centerAlignText();
  }

  function addRow(a, b) {
    const r = widget.addStack();
    r.centerAlignContent();
    addCircleItem(r, a);
    r.addSpacer();
    addCircleItem(r, b);
  }

  addRow(DATA[0], DATA[1]);
  widget.addSpacer(14);
  addRow(DATA[2], DATA[3]);
}

// ---------- switch ----------
if (config.widgetFamily === "small") {
  buildSmall();
} else if (config.widgetFamily === "medium") {
  buildMedium();
} else {
  buildLarge();
}

// ---------- run ----------
Script.setWidget(widget);
Script.complete();
