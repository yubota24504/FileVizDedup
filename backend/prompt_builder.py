from typing import Dict, Any

def build_explain_prompt(group: Dict[str, Any], lang: str) -> str:
    """
    Builds a prompt to explain a group of duplicate files for an LLM.

    Args:
        group (Dict[str, Any]): A dictionary representing a group of duplicate files.
                               Expected keys: 'paths', 'hash', 'size'.
        lang (str): The language for the prompt ('ja' or 'en').

    Returns:
        str: A formatted prompt string for the LLM.
    """
    paths_str = "\n".join(f"- {p}" for p in group.get("paths", []))
    file_hash = group.get("hash", "N/A")
    file_size = group.get("size", "N/A")

    if lang == "ja":
        # Strict instructions for the LLM to control output language and prevent speculation.
        # It is explicitly told to use only the provided hash, size, and path as evidence.
        prompt = f"""あなたは日本語のみで回答するアシスタントです。
英語での回答は禁止です。
出力は必ず日本語で行ってください。

あなたはファイルの中身（音声・画像・動画・タグ・メタデータ）を確認できません。
入力として与えられた hash / size / path のみを根拠に説明してください。

根拠のない推測は禁止です。
「同じ曲」「同じ内容」「音楽ファイル」「メタデータが同じ」など、
入力情報から判断できない内容には言及しないでください。

hash が完全に一致している場合のみ「完全に同一のファイル」と断定してよい
hash が異なる場合は断定せず、「可能性がある」表現に留める
説明は簡潔に、箇条書きで 4〜6 行程度にまとめる

---

以下の重複ファイルグループについて、上記の指示に厳密に従って、技術的根拠に基づく簡潔な説明を生成してください。

# 技術的根拠
- Hash: {file_hash}
- Size: {file_size} bytes

# ファイルリスト
{paths_str}

# 説明 (日本語、箇条書き4〜6行):
"""
    else:  # Default to English
        # English prompt now also includes hash and size to be more informative.
        prompt = f"""Please generate an explanation for the following group of duplicate files.

# Instructions:
- Explain the basis for identifying these as duplicate files. Base your explanation on the provided hash and size.
- Propose general criteria for deciding which file to keep and which to delete.
- Briefly state the precautions to take when deleting the files.
- Use a bulleted list format (-, *, etc.) for the output and keep it within 5 lines total.

# Technical Evidence
- Hash: {file_hash}
- Size: {file_size} bytes

# File List
{paths_str}

# Explanation
"""
    return prompt
