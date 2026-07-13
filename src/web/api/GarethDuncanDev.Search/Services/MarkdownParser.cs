using System.Text.RegularExpressions;
using GarethDuncanDev.Search.Models;

namespace GarethDuncanDev.Search.Services;

public static partial class MarkdownParser
{
    public static Article? Parse(string filePath, string type)
    {
        var text = File.ReadAllText(filePath);
        var match = FrontmatterRegex().Match(text);

        if (!match.Success)
            return null;

        var frontmatter = match.Groups[1].Value;
        var body = text[(match.Index + match.Length)..].Trim();

        var title = ExtractField(frontmatter, "title");
        var date = ExtractField(frontmatter, "date");
        var description = ExtractField(frontmatter, "description");

        if (string.IsNullOrWhiteSpace(title) || string.IsNullOrWhiteSpace(date) || string.IsNullOrWhiteSpace(description))
            return null;

        return new Article
        {
            Slug = Path.GetFileNameWithoutExtension(filePath),
            Title = title,
            Date = date,
            Description = description,
            Content = body,
            Type = type
        };
    }

    private static string? ExtractField(string frontmatter, string key)
    {
        var match = Regex.Match(frontmatter, $@"^{key}:\s*(.+)$", RegexOptions.Multiline);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    [GeneratedRegex(@"^---\n([\s\S]*?)\n---", RegexOptions.None)]
    private static partial Regex FrontmatterRegex();
}
