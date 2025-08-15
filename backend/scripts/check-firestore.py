#!/usr/bin/env python3
import argparse, os, sys
def main():
    p = argparse.ArgumentParser()
    p.add_argument('--key', help='Caminho do JSON da service account (opcional)')
    a = p.parse_args()
    if a.key:
        os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = os.path.abspath(a.key)
    print('GOOGLE_APPLICATION_CREDENTIALS =', os.getenv('GOOGLE_APPLICATION_CREDENTIALS'))
    try:
        from google.cloud import firestore
        c = firestore.Client()
        _ = next(c.collections(), None)
        print('OK: credencial válida e Firestore acessível. Projeto =', getattr(c, "project", None))
        sys.exit(0)
    except Exception as e:
        print('ERRO: falha ao acessar Firestore ->', e)
        sys.exit(1)
if __name__ == '__main__':
    main()
