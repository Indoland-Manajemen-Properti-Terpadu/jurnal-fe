import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Box, Button, Group, Image, Text } from '@mantine/core';
import { IconEraser, IconSignature, IconUpload } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { WRITE_OFF_LIMITS } from '@/module/assets/domain/writeOffRules';
import classes from '@/module/assets/presentation/components/SignaturePad.module.css';

export type SignaturePadProps = {
  value: Blob | null;
  onChange: (signature: Blob | null) => void;
  label: string;
  error?: string;
};

type Point = { x: number; y: number };

const INK_WIDTH = 2.4;

/** The canvas takes its ink from its CSS `color` (the brand's darkest blue). */
const inkColor = (canvas: HTMLCanvasElement) => getComputedStyle(canvas).color;

/**
 * A signature drawn with a mouse, pen or finger, or an uploaded image of one. Drawing exports
 * a PNG when the stroke ends; keyboard users take the upload path.
 */
export function SignaturePad({ value, onChange, label, error }: Readonly<SignaturePadProps>) {
  const { t } = useTranslation('assetWriteOffs');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const last = useRef<Point | null>(null);
  const [drawn, setDrawn] = useState(false);
  const [uploaded, setUploaded] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Size the canvas to its box once, at the screen's pixel density.
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    context.scale(ratio, ratio);
  }, []);

  useEffect(
    () => () => {
      if (uploaded) URL.revokeObjectURL(uploaded);
    },
    [uploaded]
  );

  // A cleared value from outside (a reset form) empties the pad too.
  useEffect(() => {
    if (value) return;
    setUploaded(null);
    setDrawn(false);
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }, [value]);

  const pointOf = (event: PointerEvent<HTMLCanvasElement>): Point => {
    const box = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const start = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    last.current = pointOf(event);
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    const context = event.currentTarget.getContext('2d');
    if (!last.current || !context) return;
    const next = pointOf(event);
    context.strokeStyle = inkColor(event.currentTarget);
    context.lineWidth = INK_WIDTH;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(last.current.x, last.current.y);
    context.lineTo(next.x, next.y);
    context.stroke();
    last.current = next;
    if (!drawn) setDrawn(true);
  };

  const end = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!last.current) return;
    last.current = null;
    if (!drawn) return;
    event.currentTarget.toBlob((blob) => blob && onChange(blob), 'image/png');
  };

  const clear = () => {
    setFileError(null);
    onChange(null);
  };

  const upload = (file: File | undefined) => {
    if (!file) return;
    if (!(WRITE_OFF_LIMITS.signatureMime as readonly string[]).includes(file.type)) {
      setFileError(t('errSignatureFile'));
      return;
    }
    setFileError(null);
    setUploaded(URL.createObjectURL(file));
    onChange(file);
  };

  const message = fileError ?? error;

  return (
    <Box>
      <Text size="sm" fw={500} mb={6}>
        {label}
      </Text>
      <Box
        className={classes.pad}
        data-error={Boolean(message) || undefined}
        role="group"
        aria-label={t('signatureCanvas')}
      >
        {uploaded ? (
          <Image
            src={uploaded}
            alt={t('signatureUploaded')}
            className={classes.image}
            fit="contain"
          />
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className={classes.canvas}
              aria-label={t('signatureCanvas')}
              onPointerDown={start}
              onPointerMove={move}
              onPointerUp={end}
              onPointerLeave={end}
            />
            {!drawn && (
              <Group gap={6} className={classes.hint} aria-hidden="true">
                <IconSignature size={18} />
                <Text size="sm">{t('signatureHint')}</Text>
              </Group>
            )}
            <span className={classes.baseline} aria-hidden="true" />
          </>
        )}
      </Box>
      <Group justify="space-between" mt={8} gap="xs">
        <Text size="xs" c={message ? 'red.7' : 'dimmed'} role={message ? 'alert' : undefined}>
          {message ?? ''}
        </Text>
        <Group gap="xs">
          <Button
            variant="subtle"
            color="gray"
            size="compact-sm"
            leftSection={<IconEraser size={14} />}
            onClick={clear}
            disabled={!value && !drawn}
          >
            {t('signatureClear')}
          </Button>
          <Button
            variant="light"
            size="compact-sm"
            leftSection={<IconUpload size={14} />}
            onClick={() => inputRef.current?.click()}
          >
            {t('signatureUpload')}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept={WRITE_OFF_LIMITS.signatureMime.join(',')}
            aria-label={t('signatureUpload')}
            tabIndex={-1}
            aria-hidden="true"
            className={classes.input}
            onChange={(event) => {
              upload(event.currentTarget.files?.[0]);
              event.currentTarget.value = '';
            }}
          />
        </Group>
      </Group>
    </Box>
  );
}

export default SignaturePad;
