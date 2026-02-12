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

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final StorageService _storage = StorageService();
  List<TokenModel> _tokens = [];
  Timer? _timer;
  int _secondsLeft = 30;
  bool _isLoading = true;

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
      _isLoading = false;
    });
  }

  Future<void> _deleteToken(String id) async {
    await _storage.deleteToken(id);
    _loadTokens();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Account removed')),
      );
    }
  }

  Future<void> _addToken() async {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 48, 
                height: 4, 
                decoration: BoxDecoration(color: Colors.grey[200], borderRadius: BorderRadius.circular(2))
              ),
            ),
            const SizedBox(height: 24),
            Text('Add Account', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            _buildActionTile(
              icon: Icons.qr_code_scanner_rounded,
              color: const Color(0xFF4F46E5),
              title: 'Scan QR Code',
              subtitle: 'Scan a code from your admin panel',
              onTap: () {
                Navigator.pop(ctx);
                _scanToken();
              },
            ),
            const SizedBox(height: 16),
            _buildActionTile(
              icon: Icons.keyboard_alt_rounded,
              color: const Color(0xFF10B981),
              title: 'Enter Manually',
              subtitle: 'Type the Secret Key provided',
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

  Widget _buildActionTile({
    required IconData icon, 
    required Color color, 
    required String title, 
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade100),
          borderRadius: BorderRadius.circular(16),
          color: Colors.grey.shade50,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  Text(subtitle, style: TextStyle(color: Colors.grey.shade500, fontSize: 13)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.grey.shade300),
          ],
        ),
      ),
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
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Enter Details", style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
              const SizedBox(height: 24),
              TextField(
                controller: accountCtrl,
                decoration: InputDecoration(
                  labelText: "Account Name",
                  filled: true,
                  fillColor: Colors.grey[50],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: secretCtrl,
                decoration: InputDecoration(
                  labelText: "Secret Key",
                  hintText: "JBSW...",
                  filled: true,
                  fillColor: Colors.grey[50],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                ),
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.pop(ctx),
                    child: Text("Cancel", style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    style: FilledButton.styleFrom(
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
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
                    child: const Text("Save Account", style: TextStyle(fontWeight: FontWeight.w600)),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );

    if (newToken != null) {
      await _storage.saveToken(newToken);
      _loadTokens();
    }
  }

  void _copyToClipboard(String code) {
    Clipboard.setData(ClipboardData(text: code));
    HapticFeedback.lightImpact();
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Text("Code $code copied", style: GoogleFonts.inter(fontWeight: FontWeight.w500)),
          ],
        ),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        backgroundColor: Colors.black87,
        duration: const Duration(seconds: 1),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator()) 
        : CustomScrollView(
            slivers: [
              SliverAppBar.large(
                title: const Text("Authenticator"),
                centerTitle: false,
                backgroundColor: const Color(0xFFF8FAFC),
                actions: [
                  IconButton(
                    icon: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      child: const Icon(Icons.add_rounded, color: Colors.indigo),
                    ),
                    onPressed: _addToken,
                  ),
                  const SizedBox(width: 16),
                ],
              ),
              if (_tokens.isEmpty)
                SliverFillRemaining(
                  hasScrollBody: false,
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.indigo.withOpacity(0.1), blurRadius: 20, offset: const Offset(0, 10))
                            ]
                          ),
                          child: const Icon(Icons.shield_outlined, size: 64, color: Colors.indigoAccent),
                        ),
                        const SizedBox(height: 24),
                        Text("No Accounts Yet", style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold, color: Colors.blueGrey[800])),
                        const SizedBox(height: 8),
                        Text("Add an account to get started", style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.blueGrey[400])),
                        const SizedBox(height: 32),
                        FilledButton.icon(
                          onPressed: _addToken,
                          icon: const Icon(Icons.qr_code_scanner),
                          label: const Text("Add First Account"),
                          style: FilledButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.all(16),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final token = _tokens[index];
                        final code = OtpService.generateTotp(token.secret);
                        final progressColor = _secondsLeft < 5 ? Colors.red : (_secondsLeft < 10 ? Colors.orange : const Color(0xFF4F46E5));

                        return Dismissible(
                          key: Key(token.id),
                          direction: DismissDirection.endToStart,
                          background: Container(
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.only(right: 24),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                          ),
                          confirmDismiss: (direction) async {
                            return await showDialog(
                              context: context,
                              builder: (ctx) => AlertDialog(
                                title: const Text("Remove Account?"),
                                content: const Text("This action cannot be undone. Make sure you have a backup."),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text("Cancel")),
                                  TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text("Remove", style: TextStyle(color: Colors.red))),
                                ],
                              )
                            );
                          },
                          onDismissed: (_) => _deleteToken(token.id),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(24),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.grey.withOpacity(0.04),
                                  blurRadius: 16,
                                  offset: const Offset(0, 8),
                                ),
                              ],
                              border: Border.all(color: Colors.grey.withOpacity(0.05)),
                            ),
                            child: Material(
                              color: Colors.transparent,
                              child: InkWell(
                                borderRadius: BorderRadius.circular(24),
                                onTap: () => _copyToClipboard(code),
                                child: Padding(
                                  padding: const EdgeInsets.all(20),
                                  child: Row(
                                    children: [
                                      // Issuer Logo Placeholder
                                      Container(
                                        width: 48,
                                        height: 48,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFEFF6FF),
                                          borderRadius: BorderRadius.circular(14),
                                        ),
                                        child: const Center(
                                          child: Icon(Icons.lock_rounded, color: Color(0xFF4F46E5)),
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      
                                      // Token Info
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              token.issuer,
                                              style: TextStyle(
                                                color: Colors.grey[500],
                                                fontSize: 12,
                                                fontWeight: FontWeight.w600,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              token.accountName,
                                              style: const TextStyle(
                                                color: Color(0xFF1E293B),
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                      
                                      // Code & Timer
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.end,
                                        children: [
                                          Text(
                                            "${code.substring(0,3)} ${code.substring(3)}",
                                            style: GoogleFonts.robotoMono(
                                              fontSize: 22,
                                              fontWeight: FontWeight.bold,
                                              color: const Color(0xFF0F172A),
                                              letterSpacing: 1,
                                            ),
                                          ),
                                          const SizedBox(height: 8),
                                          Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Text(
                                                "$_secondsLeft s",
                                                style: TextStyle(
                                                  color: progressColor,
                                                  fontWeight: FontWeight.bold,
                                                  fontSize: 12,
                                                ),
                                              ),
                                              const SizedBox(width: 8),
                                              CircularPercentIndicator(
                                                radius: 10.0,
                                                lineWidth: 3.0,
                                                percent: _secondsLeft / 30,
                                                progressColor: progressColor,
                                                backgroundColor: Colors.grey[100]!,
                                                circularStrokeCap: CircularStrokeCap.round,
                                                animation: true,
                                                animateFromLastPercent: true,
                                                animationDuration: 1000,
                                              ),
                                            ],
                                          )
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: _tokens.length,
                    ),
                  ),
                ),
            ],
          ),
    );
  }
}
