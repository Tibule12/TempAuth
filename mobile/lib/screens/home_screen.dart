import 'package:flutter/material.dart';
import 'dart:async';
import '../models/token_model.dart';
import '../services/storage_service.dart';
import '../services/otp_service.dart';
import 'scan_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final StorageService _storage = StorageService();
  List<TokenModel> _tokens = [];
  Timer? _timer;
  int _secondsLeft = 30;

  @override
  void initState() {
    super.initState();
    _loadTokens();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _secondsLeft = OtpService.getRemainingSeconds();
        // Force refresh if new cycle starts
        if (_secondsLeft == 30) {
          // just to trigger rebuild
        }
      });
    });
  }

  Future<void> _loadTokens() async {
    final tokens = await _storage.getTokens();
    setState(() {
      _tokens = tokens;
    });
  }

  Future<void> _addToken() async {
    final TokenModel? newToken = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ScanScreen()),
    );

    if (newToken != null) {
      await _storage.saveToken(newToken);
      _loadTokens();
    }
  }

  Future<void> _deleteToken(String id) async {
    if (await _confirmDelete()) {
      await _storage.deleteToken(id);
      _loadTokens();
    }
  }

  Future<bool> _confirmDelete() async {
    return await showDialog(
      context: context, 
      builder: (ctx) => AlertDialog(
        title: const Text("Remove Account"),
        content: const Text("Are you sure? This cannot be undone."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Remove")),
        ],
      )
    ) ?? false;
  }

  @override
  Widget build(BuildContext context) {
    final progress = _secondsLeft / 30.0;

    return Scaffold(
      appBar: AppBar(
        title: const Text("TempAuth MFA"),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: _addToken,
          )
        ],
      ),
      body: _tokens.isEmpty 
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.security, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text("No entries yet."),
                TextButton(onPressed: _addToken, child: const Text("Scan a QR Code"))
              ],
            ),
          )
        : Column(
            children: [
              LinearProgressIndicator(value: progress, minHeight: 4),
              Expanded(
                child: ListView.separated(
                  itemCount: _tokens.length,
                  separatorBuilder: (_, __) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final token = _tokens[index];
                    final code = OtpService.generateTotp(token.secret);
                    
                    // Simple formatting xxx xxx
                    final formattedCode = "${code.substring(0, 3)} ${code.substring(3)}";

                    return ListTile(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      title: Text(
                        formattedCode, 
                        style: const TextStyle(
                          fontSize: 28, 
                          fontWeight: FontWeight.bold, 
                          color: Colors.blueAccent,
                          letterSpacing: 2
                        )
                      ),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(token.accountName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
                          Text(token.issuer, style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () => _deleteToken(token.id),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
    );
  }
}
