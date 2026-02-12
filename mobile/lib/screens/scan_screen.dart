import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../models/token_model.dart';
import 'package:uuid/uuid.dart';

class ScanScreen extends StatefulWidget {
  const ScanScreen({super.key});

  @override
  State<ScanScreen> createState() => _ScanScreenState();
}

class _ScanScreenState extends State<ScanScreen> {
  bool _found = false;

  void _onDetect(BarcodeCapture capture) {
    if (_found) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    for (final barcode in barcodes) {
      if (barcode.rawValue != null) {
        _found = true;
        _processCode(barcode.rawValue!);
        break;
      }
    }
  }

  void _processCode(String code) {
    // Expected format: otpauth://totp/TempAuth:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=TempAuth
    try {
      final uri = Uri.parse(code);
      if (uri.scheme != 'otpauth' || uri.host != 'totp') {
        throw FormatException("Invalid QR Code");
      }

      final String? secretRaw = uri.queryParameters['secret'];
      final String issuerVal = uri.queryParameters['issuer'] ?? 'Unknown';
      // Path usually contains issuer and account name, e.g., /TempAuth:user@example.com
      // We can clean it up
      String label = uri.path.replaceAll('/', '');
      if (label.contains(':')) {
        label = label.split(':').last;
      }

      if (secretRaw == null) throw FormatException("No secret found");

      final newToken = TokenModel(
        id: const Uuid().v4(), 
        issuer: issuerVal, 
        accountName: label, 
        secret: secretRaw, 
        createdAt: DateTime.now()
      );

      Navigator.pop(context, newToken);

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error scanning code: ${e.toString()}"))
      );
      _found = false; // Allow rescanning
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Scan QR Code")),
      body: MobileScanner(
        onDetect: _onDetect,
      ),
    );
  }
}
