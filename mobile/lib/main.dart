import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter/services.dart';
import 'screens/home_screen.dart';

void main() {
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(const TempAuthApp());
}

class TempAuthApp extends StatelessWidget {
  const TempAuthApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TempAuth',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5), // Indigo 600
          background: const Color(0xFFF8FAFC), // Slate 50
          surface: Colors.white,
          primary: const Color(0xFF4F46E5),
          secondary: const Color(0xFF10B981),
        ),
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme).apply(
          bodyColor: const Color(0xFF1E293B), // Slate 800
          displayColor: const Color(0xFF0F172A), // Slate 900
        ),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: Colors.grey.shade100, width: 1),
          ),
          color: Colors.white,
          margin: EdgeInsets.zero,
        ),
        appBarTheme: AppBarTheme(
          backgroundColor: const Color(0xFFF8FAFC),
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: false,
          titleTextStyle: GoogleFonts.inter(
            color: const Color(0xFF0F172A),
            fontWeight: FontWeight.w700,
            fontSize: 24,
            letterSpacing: -0.5,
          ),
          iconTheme: const IconThemeData(color: Color(0xFF1E293B)),
        ),
        bottomSheetTheme: const BottomSheetThemeData(
          backgroundColor: Colors.white,
          surfaceTintColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

