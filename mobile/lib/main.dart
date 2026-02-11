import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const TempAuthApp());
}

class TempAuthApp extends StatelessWidget {
  const TempAuthApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TempAuth',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}
