package com.inventario_web.servicios;

import com.inventario_web.model.Asset;
import com.inventario_web.model.Planta;
import com.inventario_web.repositorio.AssetRepository;
import com.inventario_web.repositorio.PlantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class DatabaseAdminService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    private static final String CABECERA_ESPERADA = "Tag,Usuario,Tipo,Ubicación,RAM,CPU,Disco,S.O.,Otros";

    /**
     * Valida la cabecera e importa masivamente los activos desde el archivo CSV
     */
    @Transactional
    public int importarDesdeCsv(MultipartFile archivo) throws Exception {
        List<Asset> listaNuevos = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(archivo.getInputStream(), StandardCharsets.UTF_8))) {
            // Eliminar el caracter BOM si el CSV viene codificado en UTF-8 con BOM
            br.mark(1);
            if (br.read() != 0xFEFF) {
                br.reset();
            }

            String primeraLinea = br.readLine();
            if (primeraLinea == null) {
                throw new IllegalArgumentException("El archivo CSV está completamente vacío.");
            }

            // Normalizar separadores y espacios
            String delimitador = primeraLinea.contains(";") ? ";" : ",";
            String[] columnasCabecera = primeraLinea.split(delimitador, -1);
            
            // Reconstruir cabecera limpia para validar
            StringBuilder cabeceraLimpia = new StringBuilder();
            for (int i = 0; i < columnasCabecera.length; i++) {
                cabeceraLimpia.append(columnasCabecera[i].trim());
                if (i < columnasCabecera.length - 1) cabeceraLimpia.append(",");
            }

            if (!cabeceraLimpia.toString().equalsIgnoreCase(CABECERA_ESPERADA)) {
                throw new IllegalArgumentException(
                    "Las columnas del CSV no son válidas.\n\n" +
                    "Deben llamarse exactamente:\n" +
                    "Tag, Usuario, Tipo, Ubicación, RAM, CPU, Disco, S.O., Otros\n\n" +
                    "Cabecera detectada en su archivo:\n" + cabeceraLimpia.toString().replace(",", ", ")
                );
            }

            // Leer filas de datos
            String linea;
            while ((linea = br.readLine()) != null) {
                if (linea.trim().isEmpty()) continue;

                String[] datos = linea.split(delimitador, -1);

                Asset asset = new Asset();
                asset.setAssetTag(getDatoSeguro(datos, 0));
                
                // Mapeo del campo Usuario: lo asignamos a nombreUsuario y separamos nombre y apellido si es posible
                String usuarioCompleto = getDatoSeguro(datos, 1);
                asset.setNombreUsuario(usuarioCompleto);
                if (!usuarioCompleto.isEmpty()) {
                    String[] partesNombre = usuarioCompleto.split("\\s+", 2);
                    asset.setNombre(partesNombre[0]);
                    asset.setApellido(partesNombre.length > 1 ? partesNombre[1] : "");
                } else {
                    asset.setNombre("");
                    asset.setApellido("");
                }

                asset.setTipoEquipo(getDatoSeguro(datos, 2));

                // Mapear la columna Ubicación a la entidad Planta
                String nombreUbicacion = getDatoSeguro(datos, 3);
                if (!nombreUbicacion.isEmpty()) {
                    Planta planta = plantaRepository.findByNombre(nombreUbicacion).orElse(null);
                    asset.setPlanta(planta);
                } else {
                    asset.setPlanta(null);
                }

                // Mapear las especificaciones técnicas a los nombres de setters de la entidad Asset
                asset.setSnipeitRam(getDatoSeguro(datos, 4));
                asset.setSnipeitCpu(getDatoSeguro(datos, 5));
                asset.setSnipeitDisco(getDatoSeguro(datos, 6));
                asset.setSnipeitVersionSo(getDatoSeguro(datos, 7));
                asset.setSnipeitOtros(getDatoSeguro(datos, 8));

                // Posiciones por defecto
                asset.setPosX(0.0);
                asset.setPosY(0.0);

                listaNuevos.add(asset);
            }
        }

        assetRepository.saveAll(listaNuevos);
        return listaNuevos.size();
    }

    private String getDatoSeguro(String[] array, int indice) {
        return (indice < array.length) ? array[indice].trim() : "";
    }
}