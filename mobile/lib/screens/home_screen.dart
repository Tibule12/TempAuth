import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:percent_indicator/circular_percent_indicator.dart';
import 'package:google_fonts/google_fonts.dart';
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
      if (mounted) {
        setState(() {
          _secondsLeft = OtpService.getRemainingSeconds();
        });
      }
    });
  }

  Future<void> _loadTokens() async {
    final tokens = await _storage.getTokens();
    setState(() {
      _tokens = tokens;
    });
  }

  Future<void> _addToken() async {
    showModalBottomSheet(
      context: context,
      backgroundColor: Theme.of(context).cardTheme.color,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
        child: Wrap(
          runSpacing: 16,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.qr_code_scanner, color: Theme.of(context).colorScheme.primary),
              ),
              title: Text('Scan QR Code', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              subtitle: const Text('Use camera to scan'),
              onTap: () {
                Navigator.pop(ctx);
                _scanToken();
              },
            ),
            const Divider(),
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.secondary.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.keyboard, color: Theme.of(context).colorScheme.secondary),
              ),
              title: Text('Enter Manually', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
              subtitle: const Text('Type the secret key'),
              onTap: () {
                Navigator.pop(ctx);
                _manualEntry();
              },
            ),
          ],
        ),
      )
    );
  }

  Future<void> _scanToken() async {
    final TokenModel? newToken = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ScanScreen()),
    );

    if (newToken != null) {
      await _storage.saveToken(newToken);
      _loadTokens();
    }
  }

  Future<void> _manualEntry() async {
    final TextEditingController accountCtrl = TextEditingController();
    final TextEditingController secretCtrl = TextEditingController();

    final TokenModel? newToken = await showDialog<TokenModel>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text("Enter Details", style: GoogleFonts.inter(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: accountCtrl, decoration: const InputDecoration(labelText: "Account Name", border: OutlineInputBorder())),
            const SizedBox(height: 16),
            TextField(controller: secretCtrl, decoration: const InputDecoration(labelText: "Secret Key", border: OutlineInputBorder())),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("Cancel")),
          FilledButton(
            onPressed: () {
              if (accountCtrl.text.isNotEmpty && secretCtrl.text.isNotEmpty) {
                Navigator.pop(ctx, TokenModel(
                  id: DateTime.now().millisecondsSinceEpoch.toString(),
                  issuer: 'TempAuth', 
                  accountName: accountCtrl.text, 
                  secret: secretCtrl.text.replaceAll(' ', ''), 
                  createdAt: DateTime.now()
                ));
              }
            }, 
            child: const Text("Add Account")
          ),
        ],
      )
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
        content: const Text("Are you sure? This action cannot be undone."),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Remove", style: TextStyle(color: Colors.red))),
        ],
      )
    ) ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.shield, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 8),
            Text("TempAuth", style: GoogleFonts.poppins(fontWeight: FontWeight.bold, letterSpacing: 0.5)),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: IconButton.filledTonal(
              icon: const Icon(Icons.add),
              onPressed: _addToken,
              tooltip: "Add Account",
            ),
          ),
        ],
      ),
      body: _tokens.isEmpty 
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
// --- REPLACEMENT 1: surfaceContainerHighest -> surfaceVariant ---
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceVariant.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(Icons.lock_outline_rounded, size: 64, color: Theme.of(context).colorScheme.primary),
                ),
                const SizedBox(height: 24),
                Text("Secure Your Accounts", style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text("Add 2FA tokens to get started", style: GoogleFonts.inter(color: Colors.grey)),
                const SizedBox(height: 32),
                FilledButton.icon(
                  onPressed: _addToken, 
                  icon: const Icon(Icons.qr_code_scanner),
                  label: const Text("Scan QR Code"),
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                )
              ],
            ),
          )
        : ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _tokens.length,
            itemBuilder: (context, index) {
              final token = _tokens[index];
              final code = OtpService.generateTotp(token.secret);
              final formattedCode = "${code.substring(0, 3)} ${code.substring(3)}";
              final progress = _secondsLeft / 30.0;
              
              // Color logic for timer
              Color timerColor = Theme.of(context).colorScheme.primary;
              if (_secondsLeft <= 5) {
                timerColor = Colors.redAccent;
              } else if (_secondsLeft <= 10) {
                timerColor = Colors.orangeAccent;
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 16),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () {
                    Clipboard.setData(ClipboardData(text: code));
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Row(children: [const Icon(Icons.check_circle, color: Colors.white, size: 20), const SizedBox(width: 8), const Text("Copied to clipboard")]),
                        behavior: SnackBarBehavior.floating,
                        backgroundColor: Colors.black87,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        duration: const Duration(seconds: 1), 
                      )
                    );
                  },
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        CircularPercentIndicator(
                          radius: 26.0,
                          lineWidth: 5.0,
                          percent: progress,
                          center: Text(
                            "$_secondsLeft",
                            style: GoogleFonts.inter(fontWeight: FontWeight.bold, fontSize: 14, color: timerColor),
                          ),
                          progressColor: timerColor,
                          backgroundColor: timerColor.withOpacity(0.15), 
                          circularStrokeCap: CircularStrokeCap.round,
                          animation: true,
                          animateFromLastPercent: true,
                          animationDuration: 1000, 
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                formattedCode,
                                style: GoogleFonts.robotoMono(
                                  fontSize: 34,
                                  fontWeight: FontWeight.w700,
                                  color: Theme.of(context).colorScheme.onSurface,
                                  letterSpacing: 2.0,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Text(token.accountName, style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 14, color: Theme.of(context).colorScheme.onSurfaceVariant)),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.surfaceVariant,
                                      borderRadius: BorderRadius.circular(4)
                                    ),
                                    child: Text(token.issuer, style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary)),
                                  )
                                ],
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.more_vert, color: Theme.of(context).colorScheme.onSurfaceVariant),
                          onPressed: () => _deleteToken(token.id),
                        )
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
    );
  }
}
