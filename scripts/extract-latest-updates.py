#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import re
import sys
from datetime import date
from pathlib import Path
from zipfile import ZipFile

MONTHS = {
    "jan": 1, "january": 1,
    "feb": 2, "february": 2,
    "mar": 3, "march": 3,
    "apr": 4, "april": 4,
    "may": 5,
    "jun": 6, "june": 6,
    "jul": 7, "july": 7,
    "aug": 8, "august": 8,
    "sep": 9, "sept": 9, "september": 9,
    "oct": 10, "october": 10,
    "nov": 11, "november": 11,
    "dec": 12, "december": 12,
}

SPORT_KEYWORDS = [
    ("cricket", ["cricket", "bca", "cpl", "test", "wicket", "tridents", "knight riders", "falcons", "amazon warriors"]),
    ("football", ["football", "bfa", "premier league", "fc", "rangers"]),
    ("netball", ["netball"]),
    ("cycling", ["cycling", "mountain bike"]),
    ("horse racing", ["garrison savannah", "horse", "btc racing"]),
    ("motorsport", ["grand prix", "motor", "racing calendar", "bushy park", "brc"]),
    ("chess", ["chess"]),
    ("hockey", ["hockey"]),
    ("athletics", ["diamond league", "marathon", "athletics"]),
    ("tennis", ["tennis", "u.s open", "us open"]),
    ("rowing", ["rowing"]),
    ("gymnastics", ["gymnastics"]),
    ("squash", ["squash"]),
    ("basketball", ["fiba", "basketball"]),
    ("bodybuilding", ["bodybuilding"]),
    ("multi-sport", ["multi-sports", "mediterranean games"]),
]


def clean(value: str) -> str:
    value = html.unescape(value or "")
    value = value.replace("\u2026", "...")
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"\s+([.,;:])", r"\1", value)
    return value.strip(" .\t\r\n")


def extract_docx(path: Path) -> str:
    with ZipFile(path) as zf:
        xml = zf.read("word/document.xml").decode("utf-8", errors="ignore")
    xml = re.sub(r"</w:p>|</w:tr>", "\n", xml)
    xml = re.sub(r"<[^>]+>", " ", xml)
    return clean(xml)


def extract_pdf(path: Path) -> str:
    try:
        import pdfplumber  # type: ignore
    except Exception as exc:
        raise RuntimeError("PDF extraction requires pdfplumber on the server") from exc

    with pdfplumber.open(str(path)) as pdf:
        return clean("\n".join(page.extract_text() or "" for page in pdf.pages))


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".docx":
        return extract_docx(path)
    if suffix == ".pdf":
        return extract_pdf(path)
    return clean(path.read_text(encoding="utf-8", errors="ignore"))


def infer_year(text: str) -> int:
    match = re.search(r"\b(20\d{2})\b", text)
    return int(match.group(1)) if match else date.today().year


def normalize_day(day: str) -> str:
    return day.lower().rstrip(".")


def item_date(year: int, month_raw: str, day_raw: str) -> str:
    month = MONTHS[month_raw.lower().rstrip(".")]
    return date(year, month, int(day_raw)).isoformat()


def infer_sport(item: str) -> str:
    lower = item.lower()
    for sport, keywords in SPORT_KEYWORDS:
        if any(keyword in lower for keyword in keywords):
            return sport.title()
    return "General Sports"


def infer_type(item: str) -> str:
    lower = item.lower()
    if re.search(r"\b[\w'& .-]+\s+v(?:s|\.)?\s+[\w'& .-]+", item, re.IGNORECASE):
        return "FIXTURE"
    if any(word in lower for word in ["championship", "tournament", "cup", "league", "final", "semi-final", "qualifier"]):
        return "COMPETITION"
    if any(word in lower for word in ["camp", "festival"]):
        return "EVENT"
    if any(word in lower for word in ["grand prix", "racing", "race meet"]):
        return "RACING"
    return "UPDATE"


def extract_time(item: str) -> str:
    match = re.search(r"\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b", item, re.IGNORECASE)
    return match.group(1).replace(" ", "").lower() if match else ""


def extract_venue(item: str) -> str:
    match = re.search(r"\bat\s+([^.;]+)$", item, re.IGNORECASE)
    if not match:
        match = re.search(r"\bat\s+([^.;,]+)", item, re.IGNORECASE)
    return clean(match.group(1)) if match else ""


def extract_teams(item: str) -> tuple[str, str]:
    match = re.search(r"(.+?)\s+v(?:s|\.)?\s+(.+?)(?:\s+at\s+|$)", item, re.IGNORECASE)
    if not match:
        return "", ""
    return clean(match.group(1)), clean(match.group(2))


def split_items(segment: str) -> list[str]:
    segment = re.sub(r"\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*[.]+\s*", r"\1 ", segment, flags=re.IGNORECASE)
    raw_items = re.split(r"\s*(?:\.{2,}|\.\s+|;\s+|\n+)\s*", segment)
    items = [clean(item) for item in raw_items if len(clean(item)) > 3]
    return items


def parse_updates(text: str, source_name: str) -> list[dict[str, object]]:
    year = infer_year(text)
    heading_pattern = re.compile(
        r"\b((?:Sat(?:urday)?|Sun(?:day)?|Mon(?:day)?|Tue(?:s|sday)?|Tues(?:day)?|Wed(?:nesday)?|Thu(?:rs|rsday)?|Thursday|Fri(?:day)?))\s+"
        r"(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+"
        r"(\d{1,2})(?:st|nd|rd|th)?\.?",
        re.IGNORECASE,
    )
    matches = list(heading_pattern.finditer(text))
    updates: list[dict[str, object]] = []

    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        event_date = item_date(year, match.group(2), match.group(3))
        segment = text[start:end]
        for item in split_items(segment):
            title = re.sub(r"^\d{1,2}(?::\d{2})?\s*(?:am|pm)\s*", "", item, flags=re.IGNORECASE)
            title = clean(title)
            if not title or re.fullmatch(r",?\s*20\d{2}", title):
                continue
            home, away = extract_teams(title)
            updates.append(
                {
                    "title": title[:255],
                    "description": item,
                    "sport": infer_sport(title),
                    "event_type": infer_type(title),
                    "start_date": event_date,
                    "end_date": event_date,
                    "time": extract_time(item),
                    "venue": extract_venue(title),
                    "location": extract_venue(title),
                    "home_team": home,
                    "away_team": away,
                    "source_file": source_name,
                    "confidence_score": 0.86 if home or extract_time(item) or extract_venue(title) else 0.72,
                }
            )

    return updates


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path is required"}))
        return 1
    path = Path(sys.argv[1])
    source_name = sys.argv[2] if len(sys.argv) > 2 else path.name
    try:
        text = extract_text(path)
        updates = parse_updates(text, source_name)
        print(json.dumps({"text_length": len(text), "updates": updates}, ensure_ascii=False))
        return 0
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
