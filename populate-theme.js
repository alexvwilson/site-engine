const fs = require('fs');

// Color calculations
const colors = {
  scheme1: {
    name: "Creative Media Pink",
    description: "Energetic and expressive for content creators who want to stand out",
    primary: "310 75% 58%",
    primaryDark: "310 70% 63%",
    success: "140 75% 52%", // Warm green
    successDark: "140 70% 57%",
    warning: "35 85% 60%", // Warm orange
    warningDark: "35 80% 65%",
    destructive: "8 75% 54%", // Warm red
    destructiveDark: "8 70% 59%",
    // Light variant 2 (warm off-white)
    light2Bg: "30 20% 98%",
    light2Muted: "30 15% 93%",
    // Light variant 3 (brand tint)
    light3Bg: "310 10% 97%",
    light3Muted: "310 14% 92%",
    // Dark variant 2 (complementary - pink-tinted)
    dark2Bg: "310 22% 7%",
    dark2Muted: "310 16% 14%",
    dark2MutedFg: "310 8% 70%",
    dark2Border: "310 12% 18%",
    dark2Card: "310 22% 7%"
  },
  scheme2: {
    name: "Professional Audio Blue",
    description: "Trustworthy and reliable for established podcasters and producers",
    primary: "220 80% 58%",
    primaryDark: "220 75% 63%",
    success: "135 75% 50%", // Cool green
    successDark: "135 70% 55%",
    warning: "42 85% 58%", // Cool amber
    warningDark: "42 80% 63%",
    destructive: "5 75% 55%", // Cool red
    destructiveDark: "5 70% 60%",
    // Light variant 2 (cool off-white)
    light2Bg: "220 15% 98%",
    light2Muted: "220 12% 93%",
    // Light variant 3 (brand tint)
    light3Bg: "220 10% 97%",
    light3Muted: "220 14% 92%",
    // Dark variant 2 (complementary - blue-tinted)
    dark2Bg: "220 16% 9%",
    dark2Muted: "220 12% 16%",
    dark2MutedFg: "220 8% 70%",
    dark2Border: "220 10% 19%",
    dark2Card: "220 16% 9%"
  },
  scheme3: {
    name: "Tech Innovation Purple",
    description: "AI-powered and cutting-edge for tech-savvy content creators",
    primary: "270 85% 60%",
    primaryDark: "270 80% 65%",
    success: "140 80% 52%", // Vibrant cool green
    successDark: "140 75% 57%",
    warning: "42 90% 58%", // Bright amber
    warningDark: "42 85% 63%",
    destructive: "358 85% 60%", // Cool red
    destructiveDark: "358 80% 65%",
    // Light variant 2 (cool off-white)
    light2Bg: "220 15% 98%",
    light2Muted: "220 12% 93%",
    // Light variant 3 (brand tint)
    light3Bg: "270 10% 97%",
    light3Muted: "270 14% 92%",
    // Dark variant 2 (complementary - purple-tinted)
    dark2Bg: "270 18% 8%",
    dark2Muted: "270 14% 15%",
    dark2MutedFg: "270 8% 70%",
    dark2Border: "270 12% 18%",
    dark2Card: "270 18% 8%"
  }
};

// Read template
const template = fs.readFileSync('ai_docs/prep/theme.html', 'utf8');

// Replace placeholders
let output = template;

// App info
output = output.replace(/\/\* APP_NAME \*\//g, 'Skribo.ai');
output = output.replace(/\/\* APP_DESCRIPTION \*\//g, 'AI-powered transcription for creators');

// Replace scheme names and descriptions
output = output.replace(/\/\* SCHEME1_NAME \*\//g, colors.scheme1.name);
output = output.replace(/\/\* SCHEME1_DESCRIPTION \*\//g, colors.scheme1.description);
output = output.replace(/\/\* SCHEME2_NAME \*\//g, colors.scheme2.name);
output = output.replace(/\/\* SCHEME2_DESCRIPTION \*\//g, colors.scheme2.description);
output = output.replace(/\/\* SCHEME3_NAME \*\//g, colors.scheme3.name);
output = output.replace(/\/\* SCHEME3_DESCRIPTION \*\//g, colors.scheme3.description);

// Replace all color HSL values for each scheme
for (let i = 1; i <= 3; i++) {
  const scheme = colors[`scheme${i}`];

  // Primary colors
  output = output.replace(new RegExp(`/\\* SCHEME${i}_PRIMARY_HSL \\*/`, 'g'), scheme.primary);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_PRIMARY_DARK_HSL \\*/`, 'g'), scheme.primaryDark);

  // Supporting colors
  output = output.replace(new RegExp(`/\\* SCHEME${i}_SUCCESS_HSL \\*/`, 'g'), scheme.success);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_SUCCESS_DARK_HSL \\*/`, 'g'), scheme.successDark);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_WARNING_HSL \\*/`, 'g'), scheme.warning);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_WARNING_DARK_HSL \\*/`, 'g'), scheme.warningDark);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DESTRUCTIVE_HSL \\*/`, 'g'), scheme.destructive);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DESTRUCTIVE_DARK_HSL \\*/`, 'g'), scheme.destructiveDark);

  // Light variant 2
  output = output.replace(new RegExp(`/\\* SCHEME${i}_LIGHT2_BG \\*/`, 'g'), scheme.light2Bg);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_LIGHT2_MUTED \\*/`, 'g'), scheme.light2Muted);

  // Light variant 3
  output = output.replace(new RegExp(`/\\* SCHEME${i}_LIGHT3_BG \\*/`, 'g'), scheme.light3Bg);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_LIGHT3_MUTED \\*/`, 'g'), scheme.light3Muted);

  // Dark variant 2
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DARK2_BG \\*/`, 'g'), scheme.dark2Bg);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DARK2_MUTED \\*/`, 'g'), scheme.dark2Muted);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DARK2_MUTED_FG \\*/`, 'g'), scheme.dark2MutedFg);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DARK2_BORDER \\*/`, 'g'), scheme.dark2Border);
  output = output.replace(new RegExp(`/\\* SCHEME${i}_DARK2_CARD \\*/`, 'g'), scheme.dark2Card);
}

// Write output
fs.writeFileSync('ai_docs/prep/theme.html', output);

console.log('✅ Theme preview populated with colors:');
console.log(`
Primary 1: ${colors.scheme1.name}
  - ${colors.scheme1.description}
  - Primary: hsl(${colors.scheme1.primary})

Primary 2: ${colors.scheme2.name}
  - ${colors.scheme2.description}
  - Primary: hsl(${colors.scheme2.primary})

Primary 3: ${colors.scheme3.name}
  - ${colors.scheme3.description}
  - Primary: hsl(${colors.scheme3.primary})
`);
